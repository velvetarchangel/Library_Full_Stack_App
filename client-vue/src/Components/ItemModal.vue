<template>
  <div v-if="showItemModal">
    <v-row id="itemmodal" justify="center">
      <v-dialog v-model="showItemModal" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Item Details</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field label="Item Name*" required></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    label="Item Identifier*"
                    hint="ISBN or IMDB ID"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    :items="['Movie', 'Book']"
                    label="Type*"
                    required
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field label="Release Date" hint="YYYY"></v-text-field>
                  <v-text-field
                    label="Company"
                    hint="Publishing Company or Production company"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
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
            <v-btn color="blue darken-1" text @click="addNewEvent">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
export default {
  data() {
    return {
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
    addNewEvent() {},
  },
};
</script>
