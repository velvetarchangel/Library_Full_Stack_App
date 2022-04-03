<template>
  <div v-if="showModal">
    <v-row id="modal" justify="center">
      <v-dialog v-model="showModal" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">Event Details</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field label="Event Name*" required></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-autocomplete
                    :items="[
                      'Central Library',
                      'Fish Creek Library',
                      'Shawnessy Library',
                      'Seton Library',
                      'Bowness Library',
                      'Nose Hill Library',
                      'Crowfoot Library',
                      'Louise Riley Library',
                      'Judith Umbach Library',
                      'Virtual',
                    ]"
                    label="Location"
                    multiple
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    label="Coordinator Name"
                    hint="example of helper text only on focus"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    type="date"
                    label="Start Date"
                    hint="example of helper text only on focus"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    type="date"
                    label="End Date"
                    hint="example of helper text only on focus"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    type="time"
                    label="Start Time"
                    hint="example of helper text only on focus"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    type="time"
                    label="End Time"
                    hint="example of helper text only on focus"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label=" Coorinator Email*"
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
      showModal: false,
    };
  },
  methods: {
    show() {
      this.showModal = true;
    },
    hide() {
      this.showModal = false;
    },
    addNewEvent() {},
  },
};
</script>
