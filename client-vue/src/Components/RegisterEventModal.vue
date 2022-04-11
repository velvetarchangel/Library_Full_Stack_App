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
                  <v-text-field 
                  v-model="event_id"
                  label="Event ID*" 
                  required></v-text-field>
                </v-col>
               
                <v-col cols="20" sm="10" md="6">
                  <v-text-field
                    v-model="card_no"
                    label="Library Card Number*"
                    hint="Library Card Number"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="hide"> Close </v-btn>
            <v-btn color="blue darken-1" text @click="registerEvent">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
import { registerEventAPI } from "../services/apiServices";
export default {
  data() {
    return {
      event_id: "",
      card_no: this.$route.params.card_no,
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
    async registerEvent() {
      if (this.event_id == "" || this.showModal == "" ) {
        this.errormessage = "All fields are required";
        this.resetValidation();
      } else {
        let newEventRegister = {
          event_id: this.event_id,
          card_no: this.card_no,
        };

        await registerEventAPI(newEventRegister).then((response) => {
          if (response.status == 200) {
            newEventRegister = response.data;
                  this.showModal = false;

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