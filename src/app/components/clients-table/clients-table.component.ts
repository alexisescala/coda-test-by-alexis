import { MiaConfirmModalComponent, MiaConfirmModalConfig, MiaPagination } from '@agencycoda/mia-core';
import { MiaField, MiaFormConfig, MiaFormModalComponent, MiaFormModalConfig } from '@agencycoda/mia-form';
import { MiaColumn, MiaTableComponent, MiaTableConfig } from '@agencycoda/mia-table';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Client } from 'src/app/entities/client';
import { ClientService } from 'src/app/services/client.service';
const EMTY_STATE = 'No tenes cargado ningun elemento todavia';
const DELETE_ACTION_TYPE = 'remove';
const EDIT_CLIENT_MODAL_TITLE = 'Edit Client';
const CREATE_CLIENT_MODAL_TITLE = 'Create Client';
const DELETE_TEXT = 'Are you sure you want to delete this role?';
@Component({
  selector: 'app-clients-table',
  templateUrl: './clients-table.component.html',
  styleUrls: ['./clients-table.component.scss']
})
export class ClientsTableComponent implements OnInit {
  @ViewChild('tableComp') tableComp!: MiaTableComponent;

  tableConfig: MiaTableConfig = new MiaTableConfig();
  clientsList?: MiaPagination<any>;
  constructor(protected dialog: MatDialog, private clientService: ClientService) { }

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig() {
    this.tableConfig.service = this.clientService;
    this.tableConfig.id = 'clients-table';
    this.tableConfig.columns = [
      { key: 'name', type: 'string', title: 'Name', field_key: 'firstname' },
      { key: 'lastname', type: 'string', title: 'Last name', field_key: 'lastname' },
      { key: 'email', type: 'string', title: 'Email', field_key: 'email' },
      {
        key: 'more', type: 'more', title: '', extra: {
          actions: [
            { icon: 'create', title: 'Edit', key: 'edit' },
            { icon: 'delete', title: 'Delete', key: 'remove' },
          ]
        }
      }
    ];

    this.tableConfig.loadingColor = 'blue';
    this.tableConfig.hasEmptyScreen = true;
    this.tableConfig.emptyScreenTitle = EMTY_STATE;

    this.tableConfig.onClick.subscribe(result => {
      const { key, item: client } = result;
      if (key === DELETE_ACTION_TYPE)
        this.onDeleteClient(client);
      else {
        this.onAddEditClient(client);
      }
    });
  }

  onAddEditClient(client?: Client) {
    let data = new MiaFormModalConfig();
    data.item = client ? client : new Client();
    data.service = this.clientService;
    data.titleEdit = EDIT_CLIENT_MODAL_TITLE;
    data.titleNew = CREATE_CLIENT_MODAL_TITLE;
    let config = new MiaFormConfig();
    config.hasSubmit = false;
    config.fields = [
      { key: 'firstname', type: MiaField.TYPE_STRING, label: 'First name', validators: [Validators.required] },
      { key: 'lastname', type: MiaField.TYPE_STRING, label: 'Last name', validators: [Validators.required] },
      { key: 'email', type: MiaField.TYPE_STRING, label: 'Email', validators: [Validators.required] },
    ];
    config.errorMessages = [
      { key: 'required', message: 'The "%label%" is required.' }
    ];
    data.config = config;
    return this.dialog.open(MiaFormModalComponent, {
      width: '520px',
      panelClass: 'modal-full-width-mobile',
      data: data
    }).afterClosed().subscribe(result => {
      if (result) {
        if (!client)
          this.tableComp.loadItems();
      }
    });
  }

  onDeleteClient(client: Client) {
    let config = new MiaConfirmModalConfig();
    config.title = DELETE_TEXT;

    return this.dialog.open(MiaConfirmModalComponent, {
      width: '520px',
      panelClass: 'modal-full-width-mobile',
      data: config
    }).afterClosed().subscribe(result => {
      if (result) {
        this.clientService.removeOb(client.id)
          .subscribe((response) => {
            if (response) {
              this.tableComp.loadItems();
            }
          })
      }
    });

  }

}
