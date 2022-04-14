<template>
  <div class="container" width="80%">
    <event-modal ref="modal"></event-modal>
    <item-modal ref="itemmodal"></item-modal>
    <item-copy-modal ref="itemcopymodal"></item-copy-modal>
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
          <v-tab>
            <v-btn class="ma-2" color="secondary" @click="addCopy">
              Add Copy
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
          :single-expand="true"
          show-expand
          multi-sort
        >
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              <v-row v-if="item.participants.length === 0">
                No one is currently registered for this event</v-row
              >
              <v-spacer></v-spacer>
              <v-card-actions
                width="50%"
                v-for="(i, index) in item.participants"
                :key="index"
                height="150px"
                cols="2"
                elevation="2"
              >
                <v-col>
                  <v-avatar color="indigo">
                    <v-icon dark> mdi-account-circle </v-icon>
                  </v-avatar>
                </v-col>
                <v-col>
                  <v-card-title><b>Name: </b> {{ i.name }}</v-card-title>
                  <v-card-subtitle>
                    <div><b>Email: </b> {{ i.email }}</div>
                    <div><b>Card No:</b> {{ i.card_no }}</div>
                  </v-card-subtitle>
                </v-col>
                <v-col align-left>
                  <v-btn
                    @click="removeParticipant(i.card_no, item.event_id, index)"
                  >
                    Remove Participant</v-btn
                  >
                </v-col>
              </v-card-actions>
            </td>
          </template>
        </v-data-table>
      </v-card>
      <v-card
        v-if="searchResults.length === 0 && showSearchResult"
        class="mx-auto"
      >
        No results to display</v-card
      >
      <v-container
        v-if="searchResults.length != 0 && showSearchResult"
        fluid
        grid-list-xl
      >
        <v-container v-if="searchCategory === 'Books' && showSearchResult">
          <v-card-actions v-for="(result, index) in searchResults" :key="index">
            <v-col>
              <v-img src="https://picsum.photos/510/200?image=20"></v-img>
            </v-col>
            <v-col>
              <v-card-title> Title: {{ result.item_name }} </v-card-title>
              <v-card-subtitle>
                <b>Author name:</b> {{ result.author_name }}</v-card-subtitle
              >
              <v-divider class="mx-4"></v-divider>
              <v-card-text>
                <div>
                  <b>Release Date:</b>{{ result.release_date.substring(0, 10) }}
                </div>
                <div><b>ISBN:</b> {{ result.isbn }}</div>
                <div><b>Synopsys:</b>{{ result.item_desc }}</div>
              </v-card-text>
            </v-col>
          </v-card-actions>
        </v-container>
        <v-container v-if="searchCategory === 'Events' && showSearchResult">
          <v-card-actions
            class="pa-md-4 mx-lg-auto"
            v-for="(result, index) in searchResults"
            :key="index"
          >
            <v-col>
              <v-img src="https://picsum.photos/510/200?image=20"></v-img>
            </v-col>
            <v-col>
              <v-card-title> Event Name: {{ result.event_name }} </v-card-title>
              <v-card-subtitle>
                <b>Coordinator:</b> {{ result.coordinator }}</v-card-subtitle
              >
              <v-divider class="mx-4"></v-divider>
              <v-card-text>
                <div><b>Location:</b> {{ result.e_location }}</div>
                <div><b>Start Date:</b>{{ result.start_date }}</div>
                <div><b>End Date: </b>{{ result.end_date }}</div>
              </v-card-text>
            </v-col>
          </v-card-actions>
        </v-container>
      </v-container>
    </v-container>
  </div>
</template>
<script>
import EventModal from "../Components/EventModal.vue";
import ItemModal from "../Components/ItemModal.vue";
import ItemCopyModal from "../Components/ItemCopyModal.vue";
import {
  getAllLibraryCustomers,
  getAllEvents,
  getUserByID,
  getSearchResults,
  getStaffInformation,
  getEventParticipants,
  unregisterFromEvent,
} from "../services/apiServices";

export default {
  components: { EventModal, ItemModal, ItemCopyModal },
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
        { text: "Event coordinator", value: "staff_name" },
      ],
      searchResults: [],
      options: ["Books", "Events"],
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
      staff_map: [],
    };
  },

  methods: {
    viewCustomerList() {
      this.showCustTab = true;
      this.showEventTab = false;
      this.showSearchResult = false;
    },
    viewEventList() {
      this.showEventTab = true;
      this.showCustTab = false;
      this.showSearchResult = false;
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
    addCopy() {
      this.$refs.itemcopymodal.show();
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
    async getStaffInformation() {
      await getStaffInformation().then((response) => {
        if (response.status == 200) {
          for (let i = 0; i < response.data.length; i++) {
            this.staff_map.push(
              response.data[i].staff_id + response.data[i].name
            );
          }
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
          console.log(curr_events);
          for (let e in curr_events) {
            var event = {
              img: "https://picsum.photos/510/300?random",
              event_id: e,
              event_name: curr_events[e]["event_name"],
              e_location: curr_events[e]["event_location"],
              time: curr_events[e]["event_time"].substring(0, 10),
              staff_name: curr_events[e]["name"],
              e_coordinator: curr_events[e]["staff_id"],
            };
            this.events.push(event);
          }
        }
      });
      this.getEventParticipants();
    },
    async getEventParticipants() {
      for (let i = 0; i < this.events.length; i++) {
        await getEventParticipants(this.events[i].event_id).then((response) => {
          if (response.status == 200) {
            var participants = response.data;
            this.events[i].participants = participants;
          }
        });
      }
    },
    async search() {
      this.searchResults = []; //clear search results
      await getSearchResults(this.searchCategory, this.searchTerm).then(
        (response) => {
          if (this.searchCategory === "Books") {
            var books = response.data.books;
            for (let i = 0; i < books.length; i++) {
              var book = {
                item_name: books[i].item_name,
                author_name: books[i].author_name,
                isbn: books[i].isbn,
                item_desc: books[i].item_desc,
                item_id: books[i].item_id,
                publisher_name: books[i].publisher_name,
                release_date: books[i].release_date,
              };
              this.searchResults.push(book);
            }
          } else if (this.searchCategory == "Movies") {
            this.searchResults = response.data.movies;
          } else if (this.searchCategory == "Events") {
            var events = response.data.events;
            for (let i = 0; i < events.length; i++) {
              console.log(events[i]);
              var event = {
                event_name: events[i].event_name,
                e_location: events[i].e_location,
                start_date: events[i].event_start_date.substring(0, 10),
                end_date: events[i].end_date.substring(0, 10),
                start_time: events[i].start_time,
                end_time: events[i].end_time,
                e_coordinator: events[i].staff_id,
              };
              this.searchResults.push(event);
            }
          }
        }
      );
    },
    expandRow(item) {
      //console.log("Expanding row");
      this.expanded = item === this.expanded[0] ? [] : [item];
    },

    async removeParticipant(card_no, event_id) {
      await unregisterFromEvent(card_no, event_id).then((response) => {
        if (response.status == 200) {
          console.log("Successfully removed participants");
        }
      });
      this.events = [];
      this.getEvents();
      this.$router.go();
    },
  },

  //Functions that are triggered when page is loaded
  mounted: function () {
    this.getCustomers();
    this.getEvents();
    this.getLoggedInUser(this.card_no);
    this.getStaffInformation();
    //this.getEventParticipants();
  },

  watch: {
    model(val) {
      if (val != null) this.searchTerm = val;
    },
    mselect(val) {
      if (val != null) this.searchCategory = val;
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
