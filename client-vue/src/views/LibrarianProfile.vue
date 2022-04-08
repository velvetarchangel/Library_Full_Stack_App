<template>
  <div class="container" width="80%">
    <event-modal ref="modal"></event-modal>
    <item-modal ref="itemmodal"></item-modal>
    <v-toolbar color="orange accent-1">
      <v-app-bar-nav-icon class="hidden-sm-and-down"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h6 mr-6 hidden-sm-and-down">
        {{ this.librarianUser.name }}
      </v-toolbar-title>
      <v-row>
        <v-text-field
          v-model="model"
          :items="items"
          clearable
          hide-details
          hide-selected
          item-text="name"
          item-value="symbol"
          label="Search..."
          solo
        >
          <template v-slot:no-data>
            <v-list-item>
              <v-row>
                <v-col cols="12">
                  <v-list-item-title> Search </v-list-item-title>
                </v-col>
              </v-row>
            </v-list-item>
          </template>
          <template v-slot:selection="{ attr, on, item, selected }">
            <v-chip
              v-bind="attr"
              :input-value="selected"
              color="blue-grey"
              class="white--text"
              v-on="on"
            >
              <v-icon left> mdi-bitcoin </v-icon>
              <span v-text="item.name"></span>
            </v-chip>
          </template>
          <template v-slot:item="{ item }">
            <v-list-item-avatar
              color="indigo"
              class="text-h5 font-weight-light black--text"
            >
              {{ this.librarianUser.name.charAt(0) }}
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="item.name"></v-list-item-title>
              <v-list-item-subtitle v-text="item.symbol"></v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-bitcoin</v-icon>
            </v-list-item-action>
          </template>
        </v-text-field>
        <v-select :items="options" v-model="mselect"> </v-select>
        <v-btn class="ma-2" color="secondary" @click="search">Search</v-btn>
      </v-row>
      <template v-slot:extension>
        <v-tabs
          :hide-slider="!model"
          color="blue-grey"
          slider-color="blue-grey"
        >
          <v-tab @click="viewCustomerList"> Customers </v-tab>
          <v-tab @click="viewEventList"> Events</v-tab>
          <v-tab @click="viewSearchResults">Search Results</v-tab>
          <v-tab
            ><v-btn class="ma-2" color="secondary" @click="addEvent">
              Add Event
            </v-btn></v-tab
          >
          <v-tab>
            <v-btn class="ma-2" color="secondary" @click="addItem">
              Add Item
            </v-btn>
          </v-tab>
          <v-tab
            ><v-btn class="ma-2" color="secondary" @click="signOut"
              >Sign Out</v-btn
            ></v-tab
          >
        </v-tabs>
      </template>
    </v-toolbar>
    <v-container fluid fill-width>
      <v-card width="100vw">
        <v-data-table
          class="elevation-1 100%"
          v-if="showCustTab"
          :headers="customerHeaders"
          :items="customers"
          item-key="card_no"
          :sort-by="['card_no', 'email']"
          :sort-desc="[false, true]"
          @click:row="goToCustPage($event.card_no)"
          multi-sort
        ></v-data-table>
      </v-card>
      <v-card width="100vw">
        <v-data-table
          class="elevation-1 100%"
          v-if="showEventTab"
          :headers="eventHeaders"
          :items="events"
          :sort-by="['event_location', 'start_time']"
          :sort-desc="[false, true]"
          multi-sort
        ></v-data-table>
      </v-card>
      <v-card v-if="searchResults.length === 0" class="mx-auto">
        No results to display</v-card
      >
    </v-container>
  </div>
</template>
<script>
import EventModal from "../Components/EventModal.vue";
import ItemModal from "../Components/ItemModal.vue";
import {
  getAllLibraryCustomers,
  getAllEvents,
  getUserByID,
  getSearchResults,
} from "../services/apiServices";

export default {
  components: { EventModal, ItemModal },
  data() {
    return {
      isLoading: false,
      items: [],
      librarianUser: { name: null },
      customerHeaders: [
        {
          text: "Customer name",
          align: "start",
          value: "name",
        },
        { text: "Card Number", value: "card_no" },
        { text: "email", value: "email" },
      ],
      eventHeaders: [
        {
          text: "Event Name",
          align: "event_name",
          value: "event_name",
        },
        { text: "Event Location", value: "e_location" },
        { text: "Event Time", value: "time" },
        { text: "Event coordinator", value: "e_coordinator" },
      ],
      searchResults: [],
      options: ["Movies", "Books", "Events"],
      model: null,
      mselect: null,
      searchTerm: null,
      searchCategory: null,
      showCustTab: true,
      showEventTab: false,
      showSearchResult: false,
      events: [],
      customers: [],
      val: "",
      card_no: this.$route.params.card_no,
    };
  },

  methods: {
    viewCustomerList() {
      this.showCustTab = true;
      this.showEventTab = false;
    },
    viewEventList() {
      this.showEventTab = true;
      this.showCustTab = false;
    },
    viewSearchResults() {
      this.showSearchResult = true;
      this.showEventTab = false;
      this.showCustTab = false;
    },
    signOut() {
      this.$router.push("/");
    },
    addEvent() {
      this.$refs.modal.show();
    },
    addItem() {
      this.$refs.itemmodal.show();
    },
    goToCustPage(val) {
      //console.log(val);
      this.$router.push(`${this.card_no}/${val}`);
    },
    async getLoggedInUser(card_no) {
      await getUserByID(card_no).then((response) => {
        if (response.status == 200) {
          this.librarianUser = response.data;
        }
      });
    },
    async getCustomers() {
      await getAllLibraryCustomers().then((response) => {
        if (response.status == 200) {
          var users = response.data;
          for (let i = 0; i < users.length; i++) {
            var customer = {
              card_no: users[i].card_no,
              name: users[i]["first_name"] + " " + users[i]["last_name"],
              email: users[i]["email"],
            };
            this.customers.push(customer);
          }
        }
      });
    },
    async getEvents() {
      await getAllEvents().then((response) => {
        if (response.status == 200) {
          let curr_events = response.data;
          for (let e in curr_events) {
            var event = {
              event_name: curr_events[e]["event_name"],
              e_location: curr_events[e]["event_location"],
              time: curr_events[e]["event_time"].substring(0, 10),
              e_coordinator: curr_events[e]["staff_id"],
            };
            this.events.push(event);
          }
        }
      });
    },
    async search() {
      console.log("Search Initiated");
      console.log(
        "Search term " +
          this.searchTerm +
          " for category " +
          this.searchCategory
      );
      await getSearchResults(this.searchCategory, this.searchTerm).then(
        (response) => {
          console.log(response.data);
        }
      );
      // Now add in the search endpoint
    },
  },
  //Functions that are triggered when page is loaded
  mounted: function () {
    this.getCustomers();
    this.getEvents();
    this.getLoggedInUser(this.card_no);
  },

  watch: {
    model(val) {
      //console.log(val);
      if (val != null) this.searchTerm = val;
      console.log(this.searchTerm);
    },
    mselect(val) {
      if (val != null) this.searchCategory = val;
      console.log(this.searchCategory);
    },
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
