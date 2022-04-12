<template>
  <v-card max-width="800" class="mx-auto">
    <v-toolbar color="light-blue" dark>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title
        >Customer profile for {{ this.customer_name }}</v-toolbar-title
      >

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-view-module</v-icon>
      </v-btn>
    </v-toolbar>

    <v-list subheader two-line>
      <v-divider inset></v-divider>
      <v-subheader inset>Loaned items</v-subheader>
      <v-list-item v-if="loaned_items.length === 0" class="text-center">
        <v-btn icon><v-icon color="grey lighten-1">mdi-book-open</v-icon></v-btn
        >User currently has no items on loan
      </v-list-item>
      <v-list-item v-for="loaned_item in loaned_items" :key="loaned_item.name">
        <v-list-item-avatar>
          <v-icon
            :class="loaned_item.color"
            dark
            v-text="loaned_item.icon"
          ></v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title v-text="loaned_item.name"></v-list-item-title>

          <v-list-item-subtitle
            ><b>Checkout Date:</b>
            {{ loaned_item.checkout_date }}</v-list-item-subtitle
          >
          <v-list-item-subtitle
            ><b>Due Date:</b>{{ loaned_item.return_date }}</v-list-item-subtitle
          >
        </v-list-item-content>

        <v-list-item-action>
          <!-- <v-btn rounded color="primary" dark> Return Item </v-btn> -->
        </v-list-item-action>
      </v-list-item>

      <v-divider inset></v-divider>
      <v-subheader inset>Hold items</v-subheader>
      <v-list-item v-if="hold_items.length === 0" class="text-center">
        <v-btn icon><v-icon color="grey lighten-1">mdi-book</v-icon></v-btn>
        User currently has no items on hold
      </v-list-item>
      <v-list-item v-for="hold_item in hold_items" :key="hold_item.name">
        <v-list-item-avatar>
          <v-icon
            :class="hold_item.color"
            dark
            v-text="hold_item.icon"
          ></v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title v-text="hold_item.name"></v-list-item-title>

          <v-list-item-subtitle
            ><b>Hold Position</b>:
            {{ hold_item.hold_position }}</v-list-item-subtitle
          >
        </v-list-item-content>

        <v-list-item-action>
          <!-- <v-btn rounded color="primary" dark> Remove Hold </v-btn> -->
        </v-list-item-action>
      </v-list-item>

      <v-divider inset></v-divider>
      <v-subheader inset>Events</v-subheader>
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
          <!-- <v-btn rounded color="primary" dark> Remove Participant </v-btn> -->
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script>
import { getRegisteredEvent, getUserByID } from "../services/apiServices";
import { getUserLoanedItems } from "../services/apiServices";
import { getUserHoldItems } from "../services/apiServices";

export default {
  data() {
    return {
      customer_card: this.$route.params.customer_card,
      customer_name: "",
      admin_card: this.$route.params.admin_card,
      loaned_items: [],
      registered_events: [],
      hold_items: [],
    };
  },
  methods: {
    async getCustomer() {
      await getUserByID(this.customer_card).then((response) => {
        if (response.status == 200) {
          this.customer_name = response.data.name;
        }
      });
    },
    async getUserLoanedItems() {
      await getUserLoanedItems(this.customer_card).then((response) => {
        if (response.status == 200) {
          for (var i = 0; i < response.data.length; i++) {
            var loaned_item = {
              color: "amber",
              icon: "mdi-book-open",
              name: response.data[i].item_name,
              checkout_date: response.data[i].checkout_date.substring(0, 10),
              return_date: response.data[i].return_date.substring(0, 10),
            };
            this.loaned_items.push(loaned_item);
          }
        }
      });
    },
    async getUserHoldItems() {
      await getUserHoldItems(this.customer_card).then((response) => {
        if (response.status == 200) {
          for (var i = 0; i < response.data.length; i++) {
            var item = {
              color: "amber",
              icon: "mdi-book",
              name: response.data[i].item_name,
              hold_position: response.data[i].hold_position,
            };
            this.hold_items.push(item);
          }
        }
      });
    },
    async getRegisteredEvent() {
      await getRegisteredEvent(this.customer_card).then((response) => {
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
    this.getCustomer();
    this.getUserLoanedItems();
    this.getUserHoldItems();
    this.getRegisteredEvent();
  },
};
</script>
