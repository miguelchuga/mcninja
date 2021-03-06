odoo.define('ks_dashboard_ninja.import_button', function (require) {

"use strict";

var core = require('web.core');
var _t = core._t;
var Sidebar = require('web.Sidebar');
var ListController = require('web.ListController');
var crash_manager = require('web.crash_manager');
var framework = require('web.framework');


    ListController.include({

        // TO hide odoo default import button (it is inserted in dom by other module)
        on_attach_callback : function(){
            this._super.apply(this, arguments);
            var self = this;
            if(this.modelName == "ks_dashboard_ninja.board"){
               $('button.o_button_import').hide();
            }
        },

        // TO add custom dashboard export option under action button
        renderSidebar: function ($node){
          this._super.apply(this, arguments);

          //Only for our custom model
          if(this.modelName == "ks_dashboard_ninja.board"){
            if (this.hasSidebar) {
                var other = [];
                if(odoo.session_info.is_admin) {
                    other.push({label: _t("Export Dashboard"),
                        callback: this.ks_dashboard_export.bind(this)
                    })
                }

                if (this.is_action_enabled('delete')) {
                     other.push({
                        label: _t('Delete'),
                        callback: this._onDeleteSelectedRecords.bind(this)
                    });
                }
                var import_button = this.$el.find('.o_button_import');
                this.sidebar = new Sidebar(this, {
                editable: this.is_action_enabled('edit'),
                env: {
                    context: this.model.get(this.handle, {raw: true}).getContext(),
                    activeIds: this.getSelectedIds(),
                    model: this.modelName,
                    },
                actions: _.extend(this.toolbarActions, {other: other}),
                });
                this.sidebar.appendTo($node);

                this._toggleSidebar();
                }
            }
        },

        ks_dashboard_export: function(){
            this.ks_on_dashboard_export(this.getSelectedIds());
        },

        ks_on_dashboard_export: function (ids){
            var self = this;
            this._rpc({
                    model: 'ks_dashboard_ninja.board',
                    method: 'ks_dashboard_export',
                    args: [JSON.stringify(ids)],
                }).then(function(result){
                    var name = "dashboard_ninja";
                    var data = {
                        "header":name,
                        "dashboard_data":result,
                      }
                framework.blockUI();
                self.getSession().get_file({
                    url: '/ks_dashboard_ninja/export/dashboard_json',
                    data: {data:JSON.stringify(data)},
                    complete: framework.unblockUI,
                    error: crash_manager.rpc_error.bind(crash_manager),
                });
            })
         },

    });
    core.action_registry.add('ks_dashboard_ninja.import_button', ListController);
    return ListController;
});