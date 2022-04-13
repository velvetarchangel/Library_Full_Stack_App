<template>
  <div v-if="showItemCopyModal">
    <v-row id="itemmodal" justify="center">
      <v-dialog v-model="showItemCopyModal" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Add Item Copy</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field 
                  v-model="item_name"
                  label="Item Name*" 
                  required></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="branch_id"
                    label="Branch id*"
                    hint="Copy goes to this branch id"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="hide"> Close </v-btn>
            <v-btn color="blue darken-1" text @click="addNewItemCopy">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
import { createItemCopyAPI } from "../services/apiServices";
export default {
  data() {
    return {
      item_name: "",
      branch_id: "",
      showItemCopyModal: false,
    };
  },
  methods: {
    show() {
      this.showItemCopyModal = true;
    },
    hide() {
      this.showItemCopyModal = false;
    },
    async addNewItemCopy() {
      if (this.item_name == "" || this.branch_id == "") {
        this.errormessage = "All fields are required";
        this.resetValidation();
      } else {
        let newItemCopy = {
          item_name: this.item_name,
          branch_id: this.branch_id,
        };

        await createItemCopyAPI(newItemCopy).then((response) => {
          if (response.status == 200) {
            newItemCopy = response.data;
            this.showItemCopyModal = false;
            if (response.data.status == 400) {
              this.errormessage = response.data.message;
            } 
          }
        });
      }
    },
  },
};
</script>
