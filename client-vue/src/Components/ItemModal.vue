<template>
  <div v-if="showItemModal">
    <v-row id="itemmodal" justify="center">
      <v-dialog v-model="showItemModal" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Item Details (replace null for used fields only)</span>
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
                    v-model="isbn"
                    label="ISBN For Books"
                    hint="ISBN FOR BOOKS"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="imdb"
                    label="IMDB For Movies"
                    hint="ISBN FOR MOVIES"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    v-model="item_type"
                    :items="['Movie', 'Book']"
                    label="Type"
                    required
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field 
                  v-model="item_release_date"
                  label="Release Date*" 
                  type="date"
                  hint="YYYY"></v-text-field>
                  </v-col>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                   <v-text-field
                    v-model="publisher_name"
                    label="Book Publisher"
                    hint="Publishing Company"
                  ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="producer_name"
                    label="Movie Producer"
                    hint="Production company"
                  ></v-text-field>
                  </v-col>
                  </v-row>
                <!-- </v-col> -->
                <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="book_type"
                    label="Book Type"
                    hint="BOOK TYPE"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="duration"
                    label="Movie Duration"
                    hint="DURATION FOR MOVIES"
                    required
                  ></v-text-field>
                </v-col>
                </v-row>
                <v-col cols="12">
                  <v-textarea
                    v-model="item_description"
                    outlined
                    label="Item Description*"
                    required
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="hide"> Close </v-btn>
            <v-btn color="blue darken-1" text @click="addNewItem">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
import { createItemAPI } from "../services/apiServices";
export default {
  data() {
    return {
      item_name: "",
      isbn: "null",
      imdb: "null",
      item_type: "null",
      item_release_date: "",
      publisher_name: "null",
      producer_name: "null",
      book_type: "null",
      duration: "null",
      item_description: "",
      showItemModal: false,
    };
  },
  methods: {
    show() {
      this.showItemModal = true;
    },
    hide() {
      this.showItemModal = false;
    },
    async addNewItem() {
      if (this.item_name == "" || this.item_release_date == "" || this.item_description == "") {
        this.errormessage = "All fields are required";
        this.resetValidation();
      } else {
        let newItem = {
          item_name: this.item_name,
          isbn: this.isbn,
          imdb_id: this.imdb,
          item_type: this.item_type,
          release_date: this.item_release_date,
          publisher_name: this.publisher_name,
          production_company: this.producer_name,
          book_type: this.book_type,
          duration: this.duration,
          item_desc: this.item_description,
        };

        await createItemAPI(newItem).then((response) => {
          if (response.status == 200) {
            newItem = response.data;
            this.showItemModal = false;
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
