<template>
  <div class="container" width="80%">
    <event-modal ref="modal"></event-modal>
    <register-event-modal ref="registereventmodal"></register-event-modal>
    <item-copy-modal ref="itemcopymodal"></item-copy-modal>
    
    <v-container fluid fill-width>
      <v-card width="150vw">
        <v-data-table
          class="elevation-1 100%"
          v-if="showEventTab"
          :headers="eventHeaders"
          :items="events"
          :sort-by="['event_location', 'start_time']"
          :sort-desc="[false, true]"
          multi-sort
        >
        </v-data-table>
      </v-card>      
    </v-container>
  </div>
</template>
<script>
import EventModal from "../Components/EventModal.vue";
import RegisterEventModal from "../Components/RegisterEventModal.vue";
import ItemCopyModal from "../Components/ItemCopyModal.vue";
import {
  getAllEvents,
} from "../services/apiServices";

export default {
  components: { EventModal, RegisterEventModal, ItemCopyModal },
  data() {
    return {
      isLoading: false,
      // items: [],
      // librarianUser: { name: null },
      eventHeaders: [
        {
          text: "Event Name",
          align: "event_name",
          value: "event_name",
        },
        { text: "Event ID", value: "event_id" },
        { text: "Event Location", value: "e_location" },
        { text: "Event Time", value: "time" },
        { text: "Event Start Time", value: "e_hour" },
        { text: "Event End Time", value: "e_hour_end" },
      ],
     /*  searchResults: [],
      options: ["Movies", "Books", "Events"],
      model: null,
      mselect: null,
      searchTerm: null,
      searchCategory: null,
      showCustTab: false,  */
      showEventTab: true, 
      // showSearchResult: false,
      events: [],
      // customers: [],
      val: "",
      card_no: this.$route.params.card_no,
      staff_map: [],
    };
  },

  methods: {
    viewEventList() {
      this.showEventTab = true;
      this.showCustTab = false;
      this.showSearchResult = false;
    },
    addEvent() {
      this.$refs.modal.show();
    },
    
    async getEvents() {
      await getAllEvents().then((response) => {
        if (response.status == 200) {
          let curr_events = response.data;
          console.log(curr_events);
          for (let e in curr_events) {
            var event = {
              event_id: e,
              event_name: curr_events[e]["event_name"],
              e_location: curr_events[e]["event_location"],
              time: curr_events[e]["event_time"].substring(0, 10),
             e_coordinator: curr_events[e]["staff_id"],
             e_hour: curr_events[e]["start_time"],
             e_hour_end: curr_events[e]["end_time"],
            };
            this.events.push(event);
          }
        }
      });
    },

  },
  //Functions that are triggered when page is loaded
  mounted: function () {
    this.getEvents();
  },

};
</script>
<style scoped>
.container {
  /* position: absolute; */
  height: 80%;
  top: 5%;
}

.v-btn__content {
  color: white !important;
}
</style>
