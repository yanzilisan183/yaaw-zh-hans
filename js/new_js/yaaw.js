/*
 * Copyright (C) 2015 Binux <roy@binux.me>
 *
 * This file is part of YAAW (https://github.com/binux/yaaw).
 *
 * YAAW is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * YAAW is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You may get a copy of the GNU Lesser General Public License
 * from http://www.gnu.org/licenses/lgpl.txt
 *
 */

var YAAW = (function() {
	var selected_tasks = false;
	var on_gid = null;
	var torrent_file = null, file_type = null;
	return {
		init: function() {
			$('#main-control').show();

			this.tpl.init();
			this.setting.init();
			this.contextmenu.init();
			this.event_init();
			this.aria2_init();
			// load path
			var c = document.cookie.split('; '), p = document.getElementById('ati-dir-datalist'), kv, vs, i, j, o;
			for(i=0;i<c.length;i++){
				kv = c[i].split('=');
				if(kv[0] == 'ati-dir-datalist-values') {
					vs = unescape(kv[1]).split('\n');
					for(j=0;j<vs.length;j++){
						o = document.createElement('option');
						o.value = vs[j];
						p.appendChild(o);
					}
				}
			}
		},

		aria2_init: function() {
			ARIA2.init(this.setting.jsonrpc_path, function() {
				if (YAAW.setting.add_task_option) {
					$("#add-task-option-wrap").empty().append(YAAW.tpl.add_task_option(YAAW.setting.add_task_option));
				} else {
					ARIA2.init_add_task_option();
				}
				ARIA2.refresh();
				ARIA2.auto_refresh(YAAW.setting.refresh_interval);
				ARIA2.finish_notification = YAAW.setting.finish_notification;
				ARIA2.get_version();
				ARIA2.global_stat();
			});
		},

		event_init: function() {
			$("#add-task-submit").live("click", function() {
				YAAW.add_task.submit();return false;
			});
			$("#add-task-uri").submit(function() {
				YAAW.add_task.submit();return false;
			});
			$("#saveSettings").live("click", function() {
				YAAW.setting.submit();return false;
			});
			$("#setting-form").submit(function() {
				YAAW.setting.submit();return false;
			});
			$("#add-task-clear").live("click", function() {
				YAAW.add_task.clean();
			});
			$("#btnRemove").live("click", function() {
				YAAW.tasks.remove();YAAW.tasks.unSelectAll();
			});
			$("#btnPause").live("click", function() {
				YAAW.tasks.pause();YAAW.tasks.unSelectAll();
			});
			$("#btnUnPause").live("click", function() {
				YAAW.tasks.unpause();YAAW.tasks.unSelectAll();
			});
			$("#btnClearAlert").live("click", function() {
				$('#main-alert').hide();
			});
			$("#btnSelectActive").live("click", function() {
				YAAW.tasks.selectActive();
			});
			$("#btnSelectWaiting").live("click", function() {
				YAAW.tasks.selectWaiting();
			});
			$("#btnSelectPaused").live("click", function() {
				YAAW.tasks.selectPaused();
			});
			$("#btnSelectStopped").live("click", function() {
				YAAW.tasks.selectStopped();
			});
			$("#btnStartAll").live("click", function() {
				ARIA2.unpause_all();
			});
			$("#btnPauseAll").live("click", function() {
				ARIA2.pause_all();
			});
			$("#btnRemoveFinished").live("click", function() {
				ARIA2.purge_download_result();
			});
			$("#closeAlert").live("click", function() {
				$('#add-task-alert').hide();
			});
			$("#menuMoveTop").live("click", function() {
				YAAW.contextmenu.movetop();
			});
			$("#menuMoveUp").live("click", function() {
				YAAW.contextmenu.moveup();
			});
			$("#menuMoveDown").live("click", function() {
				YAAW.contextmenu.movedown();
			});
			$("#menuMoveEnd").live("click", function() {
				YAAW.contextmenu.moveend();
			});
			$("#menuRestart").live("click", function() {
				YAAW.contextmenu.restart();
			});
			$("#menuStart").live("click", function() {
				YAAW.contextmenu.unpause();
			});
			$("#menuPause").live("click", function() {
				YAAW.contextmenu.pause();
			});
			$("#menuRemove").live("click", function() {
				YAAW.contextmenu.remove();
			});
			$("#shutdown").live("click", function() {
				ARIA2.shutdown();
			});

			$("[rel=tooltip]").tooltip({"placement": "bottom"});

			$(".task .select-box").live("click", function() {
                                if(this.disabled) return;
				YAAW.tasks.toggle($(this).parents(".task"));
				YAAW.tasks.check_select();
			});

			$(".task .task-name > span").live("click", function() {
				var task = $(this).parents(".task");
				if (task.hasClass("info-open")) {
					YAAW.tasks.info_close();
				} else {
					YAAW.tasks.info_close();
					YAAW.tasks.info(task);
				}
			});

			$("#uri-more").click(function() {
				$("#add-task-uri .input-append").toggle();
				$("#uri-textarea").toggle();
				$("#uri-more .or-and").toggle();
				$("#uri-input").val("");
				$("#uri-textarea").val("");
				$("#ati-out").parents(".control-group").val("").toggle();
			});

			$("#ib-files .ib-file-title, #ib-files .select-box").live("click", function() {
                                if($(this).parent().find("[disabled='disabled']").length>0) return;
				if ($(this).parent().find(".select-box:first").hasClass("icon-ok")) {
					$(this).parent().find(".select-box").removeClass("icon-ok");
				} else {
					$(this).parent().find(".select-box").addClass("icon-ok");
				}
			});

			$(".ib-file-folder").live("click", function() {
				if($(this).hasClass("ib-file-folder-open")) {
					$(this).removeClass("ib-file-folder-open");
					$(this).addClass("ib-file-folder-close");
					$(this).next().next().css({"display":"none"});
				} else {
                                        $(this).removeClass("ib-file-folder-close");
                                        $(this).addClass("ib-file-folder-open");
                                        $(this).next().next().css({"display":"block"});
				}
			});

			$("#ib-file-save").live("click", function() {
				var indexes = [];
				$("#ib-files .select-box.icon-ok[data-index]").each(function(i, n) {
					indexes.push(n.getAttribute("data-index"));
				});
				if (indexes.length == 0) {
					ARIA2.main_alert("alert-error", "è‡³å°‘æœ‰ä¸€ä¸ªæ–‡ä»¶åº”è¯¥è¢«é€‰ä¸­æˆ–è€…åªæ˜¯åœæ­¢æ­¤ä»»åŠ¡", 5000);
				} else {
					var options = {
						"select-file": indexes.join(","),
					};
					ARIA2.change_option($(this).parents(".info-box").attr("data-gid"), options);
				};
			});

			$("#ib-options-a").live("click", function() {
				ARIA2.get_options($(".info-box").attr("data-gid"));
			});

			$("#ib-peers-a").live("click", function() {
				ARIA2.get_peers($(".info-box").attr("data-gid"));
			});

			var active_task_allowed_options = ["max-download-limit", "max-upload-limit"];
			$("#ib-options-save").live("click", function() {
				var options = {};
				var gid = $(this).parents(".info-box").attr("data-gid")
				var status = $("#task-gid-"+gid).attr("data-status");
				$.each($("#ib-options-form input"), function(n, e) {
					if (status == "active" && active_task_allowed_options.indexOf(e.name) == -1)
						return;
					options[e.name] = e.value;
				});
				ARIA2.change_options($(".info-box").attr("data-gid"), options);
			});

			$("#select-all-btn").click(function() {
				if (selected_tasks) {
					YAAW.tasks.unSelectAll();
				} else {
					YAAW.tasks.selectAll();
				}
			});

			$("#refresh-btn").click(function() {
				YAAW.tasks.unSelectAll();
				YAAW.tasks.info_close();
				$("#main-alert").hide();
				ARIA2.refresh();
				return false;
			});

			$("#setting-modal").on("show", function() {
				ARIA2.get_global_option();
			});

			if (window.FileReader) {
				var holder = $("#add-task-modal .modal-body").get(0);
				holder.ondragover = function() {
					$(this).addClass("hover");
					return false;
				}
				holder.ondragend = function() {
					$(this).removeClass("hover");
					return false;
				}
				holder.ondrop = function(e) {
					$(this).removeClass("hover");
					e.preventDefault();
					var file = e.dataTransfer.files[0];
					YAAW.add_task.upload(file);
					return false;
				}

				var tup = $("#torrent-up-input").get(0);
				tup.onchange = function(e) {
					var file = e.target.files[0];
					YAAW.add_task.upload(file);
				}
			} else {
				$("#torrent-up-input").remove();
				$("#torrent-up-btn").addClass("disabled").tooltip({title: "å½“å‰æµè§ˆå™¨ä¸æ”¯æŒ File API."});
			}

			if (window.applicationCache) {
				var appcache = window.applicationCache;
				$(document).ready(function() {
					if (appcache.status == appcache.IDLE)
						$("#offline-cached").text("cached");
				});
				appcache.addEventListener("cached", function(){
					$("#offline-cached").text("cached");
				});
			}
		},

		tpl: {
			init: function() {
				var _this = this;
				$("script[type='text/mustache-template']").each(function(i, n) {
					var key = n.getAttribute("id").replace(/-tpl$/, "").replace(/-/g, "_");
					_this[key] = function() {
						var tpl = Mustache.compile($(n).text());
						return function(view) {
							view._v = _this.view;
							return tpl(view);
						};
					}();
				});
			},

			files_tree: function(files) {
				var file_dict = {}, f, filtered = 0;
				for (var i = 0; i < files.length; i++) {
					var at = files[i].title.split('/');
					f = file_dict;
					for (var j = 0; j < at.length; j++) {
						f[at[j]] = f[at[j]] || {};
						f = f[at[j]];
					}
					f['_file'] = files[i];
				}

				function render(f) {
					var content = '<ul>';

					for (var k in f) {
						if (f[k]['_file'] !== undefined) {
							continue;
						}

						content += '<li>';
						content += '<i class="select-box icon-ok"></i>';
						content += '<span class="ib-file-folder ib-file-folder-open"></span>';
						content += '<span class="ib-file-title">'+$('<div>').text(k).html()+'</span>';
						content += render(f[k]);
						content += '</li>';
					}

					for (k in f) {
						if (f[k]['_file'] === undefined) {
							continue;
						}

						f[k]['_file']['relative_title'] = k;
						// è‡ªå®šä¹‰ä¿®æ”¹(by san): è·³è¿‡ æœªé€‰ä¸­çš„_____padding_file_æ–‡ä»¶, .urlæ–‡ä»¶, htm/html/mhtæ–‡ä»¶
						if(!f[k]['_file'].selected && /_____padding_file_|\.(url|htm|html|mht)$/gi.test(f[k]['_file'].title)) {
							filtered++;
							continue;
						}
						// è‡ªå®šä¹‰ä¿®æ”¹ ç»“æŸ
						content += YAAW.tpl.file(f[k]['_file']);
					}
					content += '</ul>';
					return content;
				}
			
				//console.log(file_dict);
				// è‡ªå®šä¹‰ä¿®æ”¹(by san): æ·»åŠ è¿‡æ»¤æç¤º
				// return render(file_dict);
				var rtn = render(file_dict);
				return (filtered > 0 ? '<ul style="color:#CCCCCC;">*** å·²è¿‡æ»¤æ— æ•ˆå†…å®¹[' + filtered + ']é¡¹ ***</ul>' : '') + rtn;
				// è‡ªå®šä¹‰ä¿®æ”¹ ç»“æŸ
			},

			view: {
				bitfield: function() {
					var graphic = "â–‘â–’â–“â–ˆ";
					return function(text) {
						var len = text.length;
						var result = "";
						for (var i=0; i<len; i++)
							result += graphic[Math.floor(parseInt(text[i], 16)/4)] + "&#8203;";
						return result;
					};
				},

				bitfield_to_10: function() {
					var graphic = "â–‘â–’â–“â–ˆ";
					return function(text) {
						var len = text.length;
						var part_len = Math.ceil(len/10);
						var result = "";
						for (var i=0; i<10; i++) {
							p = 0;
							for (var j=0; j<part_len; j++) {
								if (i*part_len+j >= len)
									p += 16;
								else
									p += parseInt(text[i*part_len+j], 16);
							}
							result += graphic[Math.floor(p/part_len/4)] + "&#8203;";
						}
						return result;
					};
				},

				bitfield_to_percent: function() {
					return function(text) {
						var len = text.length - 1;
						var p, one = 0;
						for (var i=0; i<len; i++) {
							p = parseInt(text[i], 16);
							for (var j=0; j<4; j++) {
								one += (p & 1);
								p >>= 1;
							}
						}
						return Math.floor(one/(4*len)*100).toString();
					};
				},

				format_size: function() {
					var format_text = ["B", "KiB", "MiB", "GiB", "TiB", ];
					return function(size) {
						if (size === '') return '';
						size = parseInt(size);
						var i = 0;
						while (size >= 1024) {
							size /= 1024;
							i++;
						}
						if (size==0) {
							return "0 KiB";
						} else {
							return size.toFixed(2)+" "+format_text[i];
						}
					};
				},

				format_size_0: function() {
					var format_text = ["B", "KiB", "MiB", "GiB", "TiB", ];
					return function(size) {
						if (size === '') return '';
						size = parseInt(size);
						var i = 0;
						while (size >= 1024) {
							size /= 1024;
							i++;
						}
						if (size==0) {
							return "0 KiB";
						} else {
							return size.toFixed(0)+" "+format_text[i];
						}
					};
				},

				format_time: function() {
					var time_interval = [60, 60, 24];
					var time_text = ["s", "m", "h"];
					return function(time) {
						if (time == Infinity) {
							return "<span style=\"color:#FFFFFF;background-color:#CCCCCC;padding:0px 4px;\">INF</span>";
						} else if (time == 0) {
							return "0s";
						}

						time = Math.floor(time);
						var i = 0;
						var result = "";
						while (time > 0 && i < 3) {
							result = time % time_interval[i] + time_text[i] + result;
							time = Math.floor(time/time_interval[i]);
							i++;
						}
						if (time > 0) {
							result = time + "d" + result;
						}
						return result;
					};
				},

				format_date: function() {
					return function(u) {
						var d, t, _pad;
						_pad = function(n) {
							return (n < 10 ? "0" : "") + n;
						};
						d = new Date(isNaN(parseInt(u, 10)) ? 0 : parseInt(u, 10) * 1e3);
						return [
							[
								_pad(d.getFullYear()),
								_pad(d.getMonth() + 1),
								_pad(d.getDate())
							].join("-"),
							[
								_pad(d.getHours()),
								_pad(d.getMinutes()),
								_pad(d.getSeconds())
							].join(":")
						].join(" ");
					};
				},

				format_peerid: function() {
					return function(peerid) {
						try {
							var ret = window.format_peerid(peerid);
							if (ret.client == 'unknown') throw 'unknown';
							return ret.client+(ret.version ? '-'+ret.version : '');
						} catch(e) {
							if (peerid == '%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00')
								return 'unknown';
							var ret = unescape(peerid).split('-');
							for (var i=0; i<ret.length; i++) {
								if (ret[i].trim().length) return ret[i];
							}
							return 'unknown';
						}
					}
				},

				error_msg: function() {
					var error_code_map = {
						0: "",
						1: "å‘ç”ŸæœªçŸ¥é”™è¯¯",
						2: "æ“ä½œè¶…æ—¶.",
						3: "èµ„æºæœªæ‰¾åˆ°.",
						4: "èµ„æºæœªæ‰¾åˆ°. å‚è§ --max-file-not-found é€‰é¡¹.",
						5: "èµ„æºæœªæ‰¾åˆ°. å‚è§ --lowest-speed-limit é€‰é¡¹.",
						6: "ç½‘ç»œå‡ºçŽ°é—®é¢˜.",
						7: "æœªå®Œæˆä¸‹è½½.",
						8: "è¿œç¨‹æœåŠ¡å™¨ä¸æ”¯æŒæ–­ç‚¹ç»­ä¼ .",
						9: "ç£ç›˜ç©ºé—´ä¸è¶³.",
						10: "åˆ†å—å¤§å°ä¸Ž.aria2æ–‡ä»¶ä¸­ä¸åŒ. å‚è§ --allow-piece-length-change é€‰é¡¹.",
						11: "Aria2 æ­£åœ¨ä¸‹è½½ç›¸åŒçš„æ–‡ä»¶.",
						12: "Aria2 æ­£åœ¨ä¸‹è½½ç›¸åŒçš„BTä»»åŠ¡.",
						13: "æ–‡ä»¶å·²å­˜åœ¨. å‚è§ --allow-overwrite é€‰é¡¹.",
						14: "æ–‡ä»¶é‡å‘½åå¤±è´¥. å‚è§ --auto-file-renaming é€‰é¡¹.",
						15: "Aria2 æ— æ³•æ‰“å¼€å½“å‰æ–‡ä»¶.",
						16: "Aria2 æ— æ³•åˆ›å»ºæ–°æ–‡ä»¶æˆ–æˆªæ–­çŽ°æœ‰æ–‡ä»¶.",
						17: "å‘ç”Ÿ I/O é”™è¯¯.",
						18: "Aria2 æ— æ³•åˆ›å»ºæ–‡ä»¶å¤¹.",
						19: "åç§°è§£æžå¤±è´¥.",
						20: "æ— æ³•è§£æžçš„ Metalink æ–‡ä»¶.",
						21: "FTP å‘½ä»¤æ‰§è¡Œå¤±è´¥.",
						22: "HTTP è¯·æ±‚å¤´é”™è¯¯æˆ–è€…æ— æ•ˆ.",
						23: "é‡å®šå‘è¿‡å¤š.",
						24: "HTTP æŽˆæƒå¤±è´¥.",
						25: "Aria2 æ— æ³•è§£æž Bencoded ç¼–ç æ–‡ä»¶ (é€šå¸¸æ˜¯ BTç§å­æ–‡ä»¶).",
						26: "BTç§å­æ–‡ä»¶æŸåæˆ–è€… Aria2æ— æ³•è¯»å–éœ€è¦çš„ä¿¡æ¯.",
						27: "æŸåçš„ç£åŠ›é“¾æŽ¥.",
						28: "é”™è¯¯çš„å‚æ•°æˆ–è€…æ— æ³•è¯†åˆ«çš„é€‰é¡¹.",
						29: "å› æš‚æ—¶è¶…è½½æˆ–ç»´æŠ¤, è¿œç¨‹æœåŠ¡å™¨æ— æ³•å¤„ç†è¯·æ±‚.",
						30: "Aria2 æ— æ³•è§£æž JSON-RPC è¯·æ±‚.",
					};
					return function(text) {
						return error_code_map[text] ? " " + error_code_map[text] : "";
					};
				},

				status_icon: function() {
					var status_icon_map = {
						active: "icon-download-alt",
						waiting: "icon-time",
						paused: "icon-pause",
						error: "icon-remove",
						complete: "icon-ok",
						removed: "icon-trash",
					};
					return function(text) {
						return status_icon_map[text] || "";
					};
				},

				status_text: function() {
					var status_text_map = {
						active: "ä¸‹è½½ä¸­",
						waiting: "ç­‰å¾…ä¸­",
						paused: "å·²æš‚åœ",
						error: "ä¸‹è½½å‡ºé”™",
						complete: "ä¸‹è½½å®Œæˆ",
						removed: "å·²åˆ é™¤",
					};
					return function(text) {
						return status_text_map[text] || "";
					};
				},
			},
		},

		add_task: {
			submit: function(_this) {
				$("#uri-input").val(Decryption($("#uri-input").val()).replace(/[\n\r]/gi, ''));
				$("#uri-textarea").val(Decryption($("#uri-textarea").val()));
				var uri = $("#uri-input").val() || $("#uri-textarea").val() && $("#uri-textarea").val().split("\n");
				var options = {}, options_save = {};
				$("#add-task-option input[name], #add-task-option textarea[name]").each(function(i, n) {
					var name = n.getAttribute("name");
					var value = (n.type == "checkbox" ? n.checked : n.value);
					if (name && value) {
						options[name] = String(value);
						if ($(n).hasClass("input-save")) {
							options_save[name] = String(value);
						}
					}
				});

				if (uri) {
					ARIA2.madd_task(uri, options);
					YAAW.setting.save_add_task_option(options_save);
				} else if (torrent_file) {
					if (file_type.indexOf("metalink") != -1) {
						ARIA2.add_metalink(torrent_file, options);
					} else {
						ARIA2.add_torrent(torrent_file, options);
					}
					YAAW.setting.save_add_task_option(options_save);
				}
				// save path
				var path = document.getElementById("ati-dir").value.replace(/^\s+|\s+$/gi,'');
				var os = document.getElementById("ati-dir-datalist").getElementsByTagName("option");
				for (var i=0,has=false,vs='';i<os.length;i++){
					vs += (vs === '' ? '' : '\n') + os[i].value;
					if(path == os[i].value) has = true;
				}
				if (!has && path !== '') {
					vs += (vs === '' ? '' : '\n') + path;
					var o = document.createElement('option');
					o.value = path;
					document.getElementById("ati-dir-datalist").appendChild(o);
				}
				var d = new Date();
				d.setFullYear(d.getFullYear() + 1);
				document.cookie = 'ati-dir-datalist-values=' + escape(vs) + '; expires=' + d.toGMTString();
			},

			clean: function() {
				$("#uri-input").attr("placeholder", "è¾“å…¥HTTP, FTP, Thunder, FlashGet, QQdl æˆ– Magnet é“¾æŽ¥");
				$("#add-task-modal .input-clear").val("");
				$("#add-task-alert").hide();
				torrent_file = null;
				file_type = null;
			},

			upload: function(file) {
				var reader = new FileReader();
				reader.onload = function(e) {
					$("#uri-input").attr("placeholder", file.name);
					torrent_file = e.target.result.replace(/.*?base64,/, "");
					file_type = file.type;
				};
				reader.onerror = function(e) {
					$("#torrent-up-input").remove();
					$("#torrent-up-btn").addClass("disabled");
				};
				reader.readAsDataURL(file);
			},
		},

		tasks: {
			check_select: function() {
				var selected = $(".tasks-table .task.selected");
				if (selected.length == 0) {
					selected_tasks = false;
					$("#select-btn .select-box").removeClass("icon-minus icon-ok");
				} else if (selected.length < $(".tasks-table .task").length) {
					selected_tasks = true;
					$("#select-btn .select-box").removeClass("icon-ok").addClass("icon-minus");
				} else {
					selected_tasks = true;
					$("#select-btn .select-box").removeClass("icon-minus").addClass("icon-ok");
				}

				if (selected.length + $(".info-box").length == 0) {
					ARIA2.select_lock(false);
				} else {
					ARIA2.select_lock(true);
				}

				if (selected_tasks) {
					$("#not-selected-grp").hide();
					$("#selected-grp").show();
				} else {
					$("#not-selected-grp").show();
					$("#selected-grp").hide();
				}
			},

			select: function(task) {
				$(task).addClass("selected").find(".select-box").addClass("icon-ok");
			},

			unSelect: function(task) {
				$(task).removeClass("selected").find(".select-box").removeClass("icon-ok");
			},

			toggle: function(task) {
				$(task).toggleClass("selected").find(".select-box").toggleClass("icon-ok");
			},

			unSelectAll: function(notupdate) {
				var _this = this;
				$(".tasks-table .task.selected").each(function(i, n) {
					_this.unSelect(n);
				});
				if (!notupdate)
					this.check_select();
			},

			selectAll: function() {
				var _this = this;
				$(".tasks-table .task").each(function(i, n) {
					_this.select(n);
				});
				this.check_select();
			},

			selectActive: function() {
				var _this = this;
				this.unSelectAll(true);
				$(".tasks-table .task[data-status=active]").each(function(i, n) {
					_this.select(n);
				});
				this.check_select();
			},

			selectWaiting: function() {
				var _this = this;
				this.unSelectAll(true);
				$(".tasks-table .task[data-status=waiting]").each(function(i, n) {
					_this.select(n);
				});
				this.check_select();
			},

			selectPaused: function() {
				var _this = this;
				this.unSelectAll(true);
				$(".tasks-table .task[data-status=paused]").each(function(i, n) {
					_this.select(n);
				});
				this.check_select();
			},

			selectStopped: function() {
				var _this = this;
				this.unSelectAll(true);
				$("#stopped-tasks-table .task").each(function(i, n) {
					_this.select(n);
				});
				this.check_select();
			},

			getSelectedGids: function() {
				var gids = new Array();
				$(".tasks-table .task.selected").each(function(i, n) {
					gids.push(n.getAttribute("data-gid"));
				});
				return gids;
			},

			pause: function() {
				var gids = new Array();
				$(".tasks-table .task.selected").each(function(i, n) {
					if (n.getAttribute("data-status") == "active" ||
						n.getAttribute("data-status") == "waiting")
						gids.push(n.getAttribute("data-gid"));
				});
				if (gids.length) ARIA2.pause(this.getSelectedGids());
			},

			unpause: function() {
				var gids = new Array();
				var stopped_gids = new Array();
				$(".tasks-table .task.selected").each(function(i, n) {
					var status = n.getAttribute("data-status");
					if (status == "paused") {
						gids.push(n.getAttribute("data-gid"));
					} else if ("removed/error".indexOf(status) != -1) {
						stopped_gids.push(n.getAttribute("data-gid"));
					}
				});
				if (gids.length) ARIA2.unpause(gids);
				if (stopped_gids.length) ARIA2.restart_task(stopped_gids);
			},

			remove: function() {
				var gids = new Array();
				var remove_list = ["active", "waiting", "paused"];
				var remove_gids = new Array();
				$(".tasks-table .task.selected").each(function(i, n) {
					if (remove_list.indexOf(n.getAttribute("data-status")) != -1)
						remove_gids.push(n.getAttribute("data-gid"));
					else
						gids.push(n.getAttribute("data-gid"));
				});
				if (remove_gids.length) ARIA2.remove(remove_gids);
				if (gids.length) ARIA2.remove_result(gids);
			},

			info: function(task) {
				task.addClass("info-open");
				task.after(YAAW.tpl.info_box({gid: task.attr("data-gid")}));
				if (task.parents("#stopped-tasks-table").length) {
					$("#ib-options-a").hide();
				}
				ARIA2.get_status(task.attr("data-gid"));
				ARIA2.select_lock(true);
			},

			info_close: function(task) {
				$(".info-box").remove();
				$(".info-open").removeClass("info-open");

				if ($(".tasks-table .task.selected").length == 0) {
					ARIA2.select_lock(false);
				} else {
					ARIA2.select_lock(true);
				}
			},
		},

		contextmenu: {
			init: function() {
				$(".task").live("contextmenu", function(ev) {
					var contextmenu_position_y = ev.clientY
					var contextmenu_position_x = ev.clientX;
					if ($(window).height() - ev.clientY < 200) {
						contextmenu_position_y = ev.clientY - $("#task-contextmenu").height();
					}
					if ($(window).width() - ev.clientX < 200) {
						contextmenu_position_x = ev.clientX - $("#task-contextmenu").width();
					}
					$("#task-contextmenu").css("top", contextmenu_position_y)
					.css("left", contextmenu_position_x).show();
					on_gid = ""+this.getAttribute("data-gid");

					var status = this.getAttribute("data-status");
					if (status == "waiting" || status == "paused") {
						$("#task-contextmenu .task-move").show();
					} else {
						$("#task-contextmenu .task-move").hide();
					}
					if (status == "removed" || status == "complete" || status == "error") {
						$(".task-restart").show();
						$(".task-start").hide();
					} else {
						$(".task-restart").hide();
						$(".task-start").show();
					}
					if (status != "waiting" || status != "active") {
						$(".task-pause").hide();
					} else {
						$(".task-pause").show();
					}
					return false;
				}).live("mouseout", function(ev) {
					// toElement is not available in Firefox, use relatedTarget instead.
					var enteredElement = ev.toElement || ev.relatedTarget;
					if ($.contains(this, enteredElement) ||
						$("#task-contextmenu").get(0) == enteredElement ||
						$.contains($("#task-contextmenu").get(0), enteredElement)) {
						return;
					}
					on_gid = null;
					$("#task-contextmenu").hide();
				});

				$("#task-contextmenu a").click(function() {
					$("#task-contextmenu").hide();
				});
				
				var mouse_on = false;
				$("#task-contextmenu").hover(function() {
					mouse_on = true;
				},
				
				function() {
					if (mouse_on) {
						on_gid = null;
						$("#task-contextmenu").hide();
					}
				});

			},

			restart: function() {
				if (on_gid) ARIA2.restart_task([on_gid, ]);
				on_gid = null;
			},

			pause: function() {
				if (on_gid) ARIA2.pause(on_gid);
				on_gid = null;
			},

			unpause: function() {
				if (on_gid) ARIA2.unpause(on_gid);
				on_gid = null;
			},

			remove: function() {
				var remove_list = ["active", "waiting", "paused"];
				if (on_gid) {
					if (remove_list.indexOf(status) !== -1) {
						ARIA2.remove(on_gid);
					} else {
						ARIA2.remove_result(on_gid);
					}
				}
				on_gid = null;
			},

			movetop: function() {
				if (on_gid) ARIA2.change_pos(on_gid, 0, 'POS_SET');
				on_gid = null;
			},

			moveup: function() {
				if (on_gid) ARIA2.change_pos(on_gid, -1, 'POS_CUR');
				on_gid = null;
			},

			movedown: function() {
				if (on_gid) ARIA2.change_pos(on_gid, 1, 'POS_CUR');
				on_gid = null;
			},

			moveend: function() {
				if (on_gid) ARIA2.change_pos(on_gid, 0, 'POS_END');
				on_gid = null;
			},

		},

		setting: {
			init: function() {
				this.jsonrpc_path = $.Storage.get("jsonrpc_path") || (/^http/.test(location.protocol) ? location.protocol : "http:") + "//localhost:6800/jsonrpc";
				this.refresh_interval = Number($.Storage.get("refresh_interval") || 3000);
				this.finish_notification = Number($.Storage.get("finish_notification") || 0);
				this.add_task_option = $.Storage.get("add_task_option");
				this.jsonrpc_history = JSON.parse($.Storage.get("jsonrpc_history") || "[]");
				if (this.add_task_option) {
					this.add_task_option = JSON.parse(this.add_task_option);
				}
				// overwrite settings with hash
				if (location.hash && location.hash.length) {
					var args = location.hash.substring(1).split('&'), kwargs = {};
					$.each(args, function(i, n) {
						n = n.split('=', 2);
						kwargs[n[0]] = n[1];
					});

					if (kwargs['path']) this.jsonrpc_path = kwargs['path'];
					this.kwargs = kwargs;
				}

				var _this = this;
				$('#setting-modal').on('hidden', function () {
					_this.update();
				});

				this.update();
			},

			save_add_task_option: function(options) {
				this.add_task_option = options;
				$.Storage.set("add_task_option", JSON.stringify(options));
			},

			save: function() {
				$.Storage.set("jsonrpc_path", this.jsonrpc_path);
				if (this.jsonrpc_history.indexOf(this.jsonrpc_path) == -1) {
					if (this.jsonrpc_history.push(this.jsonrpc_path) > 10) {
						this.jsonrpc_history.shift();
					}
					$.Storage.set("jsonrpc_history", JSON.stringify(this.jsonrpc_history));
				}
				$.Storage.set("refresh_interval", String(this.refresh_interval));
				if (this.finish_notification == 1) {
					if (!window.Notification) {
						this.finish_notification == 0;
					} else {
						window.Notification.requestPermission();
					}
				}
				$.Storage.set("finish_notification", String(this.finish_notification));
			},

			update: function() {
				$("#setting-form #rpc-path").val(this.jsonrpc_path);
				$("#setting-form input:radio[name=refresh_interval][value="+this.refresh_interval+"]").attr("checked", true);
				$("#setting-form input:radio[name=finish_notification][value="+this.finish_notification+"]").attr("checked", true);
				if (this.jsonrpc_history.length) {
					var content = '<ul class="dropdown-menu">';
					$.each(this.jsonrpc_history, function(n, e) {
						content += '<li><a href="javascript:;">'+e+'</a></li>';
					});
					content += '</ul>';
					$(".rpc-path-wrap").append(content).on("click", "li>a", function() {
						$("#setting-form #rpc-path").val($(this).text());
					});
					$(".rpc-path-wrap .dropdown-toggle").removeAttr("disabled").dropdown();
				}
			},

			submit: function() {
				_this = $("#setting-form");
				var _jsonrpc_path = _this.find("#rpc-path").val();
				var _refresh_interval = Number(_this.find("input:radio[name=refresh_interval]:checked").val());
				var _finish_notification = Number(_this.find("input:radio[name=finish_notification]:checked").val());

				var changed = false;
				if (_jsonrpc_path !== undefined && this.jsonrpc_path != _jsonrpc_path) {
					this.jsonrpc_path = _jsonrpc_path;
					YAAW.tasks.unSelectAll();
					$("#main-alert").hide();
					YAAW.aria2_init();
					changed = true;
				}
				if (_refresh_interval !== undefined && this.refresh_interval != _refresh_interval) {
					this.refresh_interval = _refresh_interval;
					ARIA2.auto_refresh(this.refresh_interval);
					changed = true;
				}
				if (_finish_notification !== undefined && this.finish_notification != _finish_notification) {
					this.finish_notification = _finish_notification;
					ARIA2.finish_notification = _finish_notification;
					changed = true;
				}
				if (changed) {
					this.save();
				}

				// submit aria2 global setting
				var options = {};
				$("#aria2-gs-form input[name]").each(function(i, n) {
					var name = n.getAttribute("name");
					var value = n.value;
					if (name && value)
						options[name] = value;
				});
				ARIA2.change_global_option(options);
				$("#setting-modal").modal('hide');
			},
		},

		notification: function(title, content) {
			if (!window.Notification) {
				return false;
			}

			var notification = new window.Notification(title, {
				body: content,
				icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADtElEQVRoQ+2ZjXHTQBCF4wqACnAqgFSAqQBSAXYFQAU4FQAVYFcQUgFOBSQV4A6ACmA/za3m5aKTTifZTma8Mze2TqfVe/vvZHLyyGXyyPGfHAnswINPTec3W28j3Td2fWHru+4/NA+8M3BfbEEiJedK4qEQeGmgPtuaRaj/2vUm7D8J9/7Y56ktPg+eA1PD8MnWPGHu14EABH/KGUJpeUgCXcDB9tXWBwENYMgiWP/ZIQjM7KXEecri6gjCZCsb5AXXHkpVLuwjB3jxm2BNQiFH1gmSJPj7oKA6s0sCgKYUstqqShOhhW2uGm6g6zLsV2E0JoGpKXxla1YIWvES31WVaZB/snc6lACgSSxA830MuTUlbaG2CYbiXedKABBYMCXcRz7aoisiVAnq95iSin9/x9K+eDW6cALEKHV2moHkTAiosoxHs47UNT6cpmpBymVuXxg1kLUT6ANEvbYxJW1ey0IcHfLmxbaD1aSe2f6P8Mw1YLA61s+tFPskwOBGNbu2BXBEu/INYChL8eTXZrldE9AG9lsMq++tKxGbWpa6XK6W4Oyv4MGu5/rcbwRqCjT3RiPQh3wuCSegsc6zmhtHAm5NuqUPV7kW7jqnpZ0ccEl6gKb0oktruF+PseF6Y59jl1FNYg3RZBLHsdbFZddVSC3tBtLxYhqKBzhvHczKLuh4ObJPAj6qaHdWg1eNDIEVoZQTz+pinc9zyOecYdZCL0Jz5TtEfDrVkfpKrcmhtoZGB4Sgunhp1z5Y5YDLORP/lIyf0XfWw1yO4qYzkKLdPy9V0PBc3CzjIxvb8MKxUA8MwTC1h2eyhhJqw6XjxVlfAisDScklX3xhsVjwzNwWIVlC5s4fr0S5DnJsT/oSAJTP4gpaq0QTGfIrt8rxfCoPtGhcYaC+BAgVBrhYqBBUJ68UDUeqioIBINPllZQ+HR4XpmfVlwDAtgkAbV6ICUFk2UEk1hd7v/rhX0KgrfZrj2jyQh8ieIERGoPhPazPJ7IO3iz626g2khhQrTgHvZwhrPBI3EgpFJRp3kkCu9SGKvEAVtApMcba1wv+PHoh4X95S9ngTmiVEEAxlklNsBu7R7culZk9uLLVlOj38qyUQFseAFzHjRIieENDxo12r8qVEmjLA1421AvZpEsJdOXBGF7IIlFKoCsPuL+1RULvVIYQ6MoDgJdWpGzSQwi05QH/nKOSUN93KkMINOUBv13xDM2nbS4ajdQQAoBYBisDGOD0h73KUAJ7Bdv0siOBQ7vgP16Px5pAuTcUAAAAAElFTkSuQmCC",
			});

			return notification;
		},
	}
})();
YAAW.init();
