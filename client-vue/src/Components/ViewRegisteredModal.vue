<template>
  <div v-if="showModal">
    <v-row id="modal" justify="center">
      <v-dialog v-model="showModal" persistent max-width="600px">
        <v-card>
          
    <v-divider inset></v-divider>
      <v-subheader inset>Events for {{this.card_no}}</v-subheader>
      <v-list-item v-if="registered_events.length === 0" class="text-center">
        <v-btn icon><v-icon color="grey lighten-1">mdi-calendar</v-icon></v-btn>
        User is currently not registered for any events 
      </v-list-item>
      <v-list-item
        v-for="registered_event in registered_events"
        :key="registered_event.event_name"
      >
        <v-list-item-avatar>
          <v-icon
            :class="registered_event.color"
            dark
            v-text="registered_event.icon"
          ></v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title
            v-text="registered_event.event_name"
          ></v-list-item-title>

          <v-list-item-subtitle
            v-text="registered_event.e_location"
          ></v-list-item-subtitle>
          <v-list-item-subtitle
            ><b>Start Date:</b
            >{{ registered_event.event_start_date }}</v-list-item-subtitle
          >
          <v-list-item-subtitle
            ><b>End Date: </b
            >{{ registered_event.end_date }}</v-list-item-subtitle
          >
        </v-list-item-content>

        <v-list-item-action>
          <v-btn icon>
            <v-icon color="grey lighten-1">mdi-information</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="hide"> Close </v-btn>
            
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
<script>
import { getRegisteredEvent } from "../services/apiServices";
export default {
  data() {
    return {
	card_no: this.$route.params.card_no,
    registered_events: [],
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
    async getRegisteredEvent() {
      await getRegisteredEvent(this.$route.params.card_no).then((response) => {
        console.log(response.data);
        if (response.status == 200) {
          for (var i = 0; i < response.data.length; i++) {
            var event = {
              color: "amber",
              icon: "mdi-calendar",
              event_name: response.data[i].event_name,
              e_location: response.data[i].e_location,
              event_start_date: response.data[i].event_start_date.substring(
                0,
                10
              ),
              end_date: response.data[i].end_date.substring(0, 10),
            };
            this.registered_events.push(event);
          }
        }
      });
    },

  },
     mounted: function () {
    this.getRegisteredEvent();
  },
};
</script>