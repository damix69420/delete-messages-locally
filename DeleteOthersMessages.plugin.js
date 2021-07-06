/**
 * @name DeleteOthersMessages
 * @author damix
 * @version 0.0.1
 * @description Allows you to delete other people's messages locally
 * @invite GctuKNS
 * @source https://github.com/damix69420/delete-messages-locally
 * @updateUrl https://raw.githubusercontent.com/damix69420/delete-messages-locally/main/DeleteOthersMessages.plugin.js
 */

// i kinda stole this and edited it from GoogleTranslateOption

module.exports = (_ => {
	const config = {
		"info": {
			"name": "DeleteOthersMessages",
			"author": "damix",
			"version": "0.0.1",
			"description": "Allows you to delete other people's messages locally"
		},
		"changeLog": {
		}
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}

		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;

		return class DeleteOthersMessages extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						storeMessages: {value: true, description: "Store Deleted Messages (you won't have to delete them again')"},
					},
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SettingsUtils, "updateLocalSettings", {after: e => BDFDB.ReactUtils.forceUpdate(toggleButton)});
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Delete_Message") : null;
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["pin", "unpin"]});
					if (index == -1) [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["edit", "add-reaction", "quote"]});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.delete_message_option,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "delete-message-locally"),
						hint: hint && (_ => {
							return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
								hint: hint
							});
						}),
						disabled: false,
						action: _ => {
							const id = `chat-messages-${e.instance.props.message.id}`;
							document.getElementById(id).remove();
						}
					}));
					this.injectSearchItem(e);
				}
			}

						
			onNativeContextMenu (e) {
				this.injectSearchItem(e);
			}
			
			onSlateContextMenu (e) {
				this.injectSearchItem(e);
			}
			
			injectSearchItem (e) {
				let text = document.getSelection().toString();
				if (text) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["delete-message-item"], group: true});
					children.splice(index > -1 ? index + 1 : 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							disabled: false,
							label: this.labels.delete_message_option,
							persisting: true,
							action: event => {}
						})
					}));
				}
			}

			setLabelsByLanguage () {
				return {
					delete_message_option: "Delete Message Locally",
				};
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
