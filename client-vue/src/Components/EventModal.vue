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
                  v-model="event_name"
                  label="Event Name*" 
                  required></v-text-field>
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
                    v-model="event_location"
                    label="Location*"
                    multiple
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="staff_id"
                    label="Coordinator Staff ID*"
                    hint="3 digit Coordinator Staff ID"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="event_start_date"
                    type="date"
                    label="Start Date*"
                    hint="start date of event"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="event_end_date"
                    type="date"
                    label="End Date*"
                    hint="end date of event"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="event_start_time"
                    type="time"
                    label="Start Time*"
                    hint="start time of event"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="event_end_time"
                    type="time"
                    label="End Time*"
                    hint="end time of event"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="card_no"
                    label=" Coorinator Card Number*"
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
import { createEventAPI } from "../services/apiServices";
export default {
  data() {
    return {
      event_name: "",
      event_start_date: "",
      event_end_date: "",
      event_start_time: "",
      event_end_time: "",
      event_location: "",
      card_no: this.$route.params.card_no,
      staff_id: "",
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
    async addNewEvent() {
      if (this.event_name == "" || this.event_start_date == "" || this.event_end_date == "" || this.event_start_time == "" 
      || this.event_end_time == "" || this.event_location == "" || this.card_no == "" || this.staff_id == "" ) {
        this.errormessage = "All fields are required";
        this.resetValidation();
      } else {
        let newEvent = {
          event_name: this.event_name,
          event_start_date: this.event_start_date,
          end_date: this.event_end_date,
          start_time: this.event_start_time,
          end_time: this.event_end_time,
          e_location: this.event_location,
          card_no: this.card_no,
          staff_id: this.staff_id,
        };

        await createEventAPI(newEvent).then((response) => {
          if (response.status == 200) {
            newEvent = response.data;
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
