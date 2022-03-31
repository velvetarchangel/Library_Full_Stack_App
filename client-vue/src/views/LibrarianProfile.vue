<template>
  <div class="container" width="80%">
    <event-modal ref="modal"></event-modal>
    <item-modal ref="itemmodal"></item-modal>
    <v-toolbar color="orange accent-1">
      <v-app-bar-nav-icon class="hidden-sm-and-down"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-h6 mr-6 hidden-sm-and-down">
        {{ name }}
      </v-toolbar-title>
      <v-row>
        <v-text-field
          v-model="model"
          :items="items"
          @keyup.enter.native="search"
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
              class="text-h5 font-weight-light white--text"
            >
              {{ item.name.charAt(0) }}
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
        <v-select :items="['Movie', 'Event', 'Book']"> </v-select>
        <v-btn>Search</v-btn>
      </v-row>
      <template v-slot:extension>
        <v-tabs
          v-model="tab"
          :hide-slider="!model"
          color="blue-grey"
          slider-color="blue-grey"
        >
          <v-tab @click="viewCustomerList"> Customers </v-tab>
          <v-tab @click="viewEventList"> Events</v-tab>
          <v-btn class="ma-2" color="secondary" @click="signOut">
            Sign Out
          </v-btn>
          <v-btn class="ma-2" color="secondary" @click="addEvent">
            Add Event
          </v-btn>
          <v-btn class="ma-2" color="secondary" @click="addItem">
            Add Item
          </v-btn>
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
          :sort-by="['card_no', 'email']"
          :sort-desc="[false, true]"
          multi-sort
        ></v-data-table>
      </v-card>
      <v-card width="100vw">
        <v-data-table
          class="elevation-1 100%"
          v-if="showEventTab"
          :headers="eventHeaders"
          :items="events"
          :sort-by="['card_no', 'email']"
          :sort-desc="[false, true]"
          multi-sort
        ></v-data-table>
      </v-card>
    </v-container>
  </div>
</template>
<script>
import EventModal from "../Components/EventModal.vue";
import ItemModal from "../Components/ItemModal.vue";
export default {
  components: { EventModal, ItemModal },
  data() {
    return {
      isLoading: false,
      items: [],
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
      model: null,
      search: null,
      tab: null,
      showCustTab: true,
      showEventTab: false,
      events: [
        {
          event_name: "Read together",
          e_location: "Louise Riley Library Room 5",
          time: "2022-03-24",
          e_coordinator: "Michelle Obama",
        },
        {
          event_name: "Read together",
          e_location: "Louise Riley Library Room 5",
          time: "2022-03-24",
          e_coordinator: "Michelle Obama",
        },
        {
          event_name: "Read together",
          e_location: "Louise Riley Library Room 5",
          time: "2022-03-24",
          e_coordinator: "Michelle Obama",
        },
        {
          event_name: "Read together",
          e_location: "Louise Riley Library Room 5",
          time: "2022-03-24",
          e_coordinator: "Michelle Obama",
        },
        {
          event_name: "Read together",
          e_location: "Louise Riley Library Room 5",
          time: "2022-03-24",
          e_coordinator: "Michelle Obama",
        },
        {
          event_name: "Read together",
          e_location: "Louise Riley Library Room 5",
          time: "2022-03-24",
          e_coordinator: "Michelle Obama",
        },
        {
          event_name: "Read together",
          e_location: "Louise Riley Library Room 5",
          time: "2022-03-24",
          e_coordinator: "Michelle Obama",
        },
        {
          event_name: "Read together",
          e_location: "Louise Riley Library Room 5",
          time: "2022-03-24",
          e_coordinator: "Michelle Obama",
        },
      ],
      customers: [
        {
          //CHANGE ME TO DYNAMIC DATA
          card_no: 12234577,
          name: "Himika Dastidar",
          email: "abc@123.com",
        },
        {
          card_no: 1231234324,
          name: "Kelly Osena",
          email: "kosena@test.com",
        },
        {
          card_no: 12132131,
          name: "Eric Tan",
          email: "etan@test.com",
        },
        {
          card_no: 12234577,
          name: "Himika Dastidar",
          email: "abc@123.com",
        },
        {
          card_no: 1231234324,
          name: "Kelly Osena",
          email: "kosena@test.com",
        },
        {
          card_no: 12132131,
          name: "Eric Tan",
          email: "etan@test.com",
        },
        {
          card_no: 12234577,
          name: "Himika Dastidar",
          email: "abc@123.com",
        },
        {
          card_no: 1231234324,
          name: "Kelly Osena",
          email: "kosena@test.com",
        },
        {
          card_no: 12132131,
          name: "Eric Tan",
          email: "etan@test.com",
        },
        {
          card_no: 12234577,
          name: "Himika Dastidar",
          email: "abc@123.com",
        },
        {
          card_no: 1231234324,
          name: "Kelly Osena",
          email: "kosena@test.com",
        },
        {
          card_no: 12132131,
          name: "Eric Tan",
          email: "etan@test.com",
        },
      ],
      val: "",
      card_no: this.$route.params.card_no,
      name: "Himika", // need to make this dynamic
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
    // addItem() {},
    signOut() {},
    addEvent() {
      this.$refs.modal.show();
    },
    addItem() {
      this.$refs.itemmodal.show();
    },
  },
  watch: {
    model(val) {
      if (val != null) this.tab = 0;
      else this.tab = null;
    },
    search() {
      console.log("Search Initiated");
      // Items have already been loaded
      if (this.items.length > 0) return;
      this.isLoading = true;
      // To be fixed to incorporate our own data
      fetch("https://api.coingecko.com/api/v3/coins/list")
        .then((res) => res.clone().json())
        .then((res) => {
          this.items = res;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.isLoading = false));
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
</style>
