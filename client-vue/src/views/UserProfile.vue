<template>
  <div>
    <register-event-modal ref="registereventmodal"></register-event-modal>
    <view-registered-modal ref="viewregisteredmodal"></view-registered-modal>
    <header>
      {{ this.cart_count }} ITEMS IN CART
      <v-btn class="ma-2" color="secondary" @click="signOut"
        >Sign Out<v-icon small right>mdi-logout</v-icon></v-btn
      >
      <div v-if="page === 'userprofile'">
        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToItems()"
          ><v-icon small left>mdi-bookshelf</v-icon>Items</v-btn
        >
        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToCart()"
          ><v-icon small left>mdi-cart</v-icon>View Cart</v-btn
        >
        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToEvents()"
          ><v-icon small left>mdi-calendar-search</v-icon>Browse Events</v-btn
        >
      </div>
      <div v-if="page === 'cart'">
        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToItems()"
          ><v-icon small left>mdi-bookshelf</v-icon>Browse Items</v-btn
        >

        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToEvents()"
          ><v-icon small left>mdi-calendar-search</v-icon>Browse Events</v-btn
        >

        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToProfile()"
          ><v-icon small left>mdi-account</v-icon>Back To Profile</v-btn
        >
      </div>
      <div v-if="page === 'items'">
        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToCart()"
          ><v-icon small left>mdi-cart</v-icon>View Cart</v-btn
        >

        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToEvents()"
          ><v-icon small left>mdi-calendar-search</v-icon>Browse Events</v-btn
        >
        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToProfile()"
          ><v-icon small left>mdi-account</v-icon>Back To Profile</v-btn
        >
      </div>
      <div v-if="page === 'events'">
        <v-btn color="secondary" class="mr-4" @click="registerEvent()"
          ><v-icon small left>mdi-bookshelf</v-icon>Register Event</v-btn
        >

        <v-btn color="secondary" class="mr-4" @click="viewRegisteredEvents()"
          ><v-icon small left>mdi-bookshelf</v-icon>View Registered Event</v-btn
        >

        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToItems()"
          ><v-icon small left>mdi-bookshelf</v-icon>Browse Items</v-btn
        >

        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToCart()"
          ><v-icon small left>mdi-cart</v-icon>View Cart</v-btn
        >

        <v-btn color="blue-grey lighten-5" class="mr-4" @click="goToProfile()"
          ><v-icon small left>mdi-account</v-icon>Back To Profile</v-btn
        >
      </div>
    </header>
    <div v-if="page === 'userprofile'">
      <template>
        <v-parallax
          height="180"
          src="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/il9FqTeLlWXU/v2/1200x-1.jpg"
        ></v-parallax>
        <h2 class="text-button ma-4">Welcome back {{ this.name }}!<br /></h2>
        <v-sheet class="mx-auto" elevation="8" max-width="1100">
          <v-card-text>
            <div class="text-overline ml-8 mb-2">
              Events you registered for:
            </div>

            <div v-if="!this.userEvents.length">
              <v-card outlined class="mx-auto" max-width="1450" height="100">
                <v-card-text class="text-center">
                  You have not registered for any events.
                </v-card-text>
              </v-card>
            </div>
            <v-timeline align-top dense>
              <v-timeline-item
                v-for="(event, index) in this.userEvents"
                :key="index"
                color="purple"
                small
              >
                <div>
                  <div class="font-weight-normal">
                    <strong>{{ event.name }}</strong> — {{ event.location }}
                  </div>
                  <div>
                    Start: {{ event.start_date }},
                    {{ event.start_time.split(":")[0] }}:{{
                      event.start_time.split(":")[1]
                    }}
                  </div>
                  <div>
                    End: {{ event.end_date }},
                    {{ event.end_time.split(":")[0] }}:{{
                      event.end_time.split(":")[1]
                    }}
                  </div>
                  <v-btn text color="grey" @click="unregisterEvent(event.id)"
                    >Unregister from this event</v-btn
                  >
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>

          <h2 class="text-button ma-4">Your borrowed items:</h2>
          <div v-if="!this.loanedItems.length">
            <v-card outlined class="mx-auto" max-width="1450" height="100">
              <v-card-text class="text-center">
                You currently do not have any borrowed items.
              </v-card-text>
            </v-card>
          </div>
          <v-slide-group
            v-model="loanDisplay"
            class="pa-4"
            active-class="success"
            show-arrows
          >
            <v-slide-item
              v-for="(item, index) in this.loanedItems"
              :key="index"
              v-slot="{ active, toggle }"
            >
              <v-card
                :color="active ? undefined : 'grey lighten-1'"
                img="http://www.raisingmiro.com/wp-content/uploads/2012/11/book.jpg"
                class="ma-4"
                height="200"
                width="300"
                @click="toggle"
              >
                <v-col class="fill-height" align="center" justify="center">
                  <v-card-title primary-title class="justify-center">
                    <v-spacer />
                    <div class="text-center">
                      <h1 class="font-weight-light">{{ item.short_name }}</h1>
                      <v-card-text class="text-caption"
                        >Due: {{ item.return_date.split(":")[0] }}:{{
                          item.return_date.split(":")[1]
                        }}</v-card-text
                      >
                    </div>
                    <v-spacer
                  /></v-card-title>
                  <v-scale-transition>
                    <v-btn
                      v-if="active"
                      color="yellow"
                      size="48"
                      @click="returnItem(item.item_barcode)"
                      >Return Item</v-btn
                    >
                  </v-scale-transition>
                </v-col>
              </v-card>
            </v-slide-item>
          </v-slide-group>
          <v-expand-transition>
            <v-sheet v-if="loanDisplay != null" height="200" tile>
              <v-row class="fill-height" align="center" justify="center">
                <h3 class="text-h6">
                  {{ this.loanedItems[loanDisplay].item_name }}
                </h3>
                <v-card-text class="text-center">{{
                  this.loanedItems[loanDisplay].item_desc
                }}</v-card-text>
              </v-row>
            </v-sheet>
          </v-expand-transition>

          <h2 class="text-button ma-4">Items you have on hold:</h2>
          <div v-if="!this.holds.length">
            <v-card outlined class="mx-auto" max-width="1450" height="100">
              <v-card-text class="text-center">
                You do not have any items on hold.
              </v-card-text>
            </v-card>
          </div>
          <v-slide-group
            v-model="holdDisplay"
            class="pa-4"
            active-class="success"
            show-arrows
          >
            <v-slide-item
              v-for="(item, index) in this.holds"
              :key="index"
              v-slot="{ active, toggle }"
            >
              <v-card
                :color="active ? undefined : 'grey lighten-1'"
                img="https://visualskins.com/media/36/minimalistic-analog-clock-rainmeter-3.jpg"
                class="ma-4"
                height="200"
                width="300"
                @click="toggle"
              >
                <v-col class="fill-height" align="center" justify="center">
                  <v-card-title primary-title class="justify-center">
                    <v-spacer />
                    <div class="text-center">
                      <h1 class="font-weight-light">{{ item.short_name }}</h1>
                      <v-card-text class="text-button text-weight-bold"
                        >Waitlist position:
                        {{ item.hold_position }}</v-card-text
                      >
                    </div>
                    <v-spacer
                  /></v-card-title>
                </v-col>
              </v-card>
            </v-slide-item>
          </v-slide-group>
          <v-expand-transition>
            <v-sheet v-if="holdDisplay != null" height="200" tile>
              <v-row class="fill-height" align="center" justify="center">
                <h3 class="text-h6">
                  {{ this.holds[holdDisplay].item_name }}
                </h3>
                <v-card-text class="text-center">{{
                  this.holds[holdDisplay].item_desc
                }}</v-card-text>
              </v-row>
            </v-sheet>
          </v-expand-transition>
        </v-sheet>
      </template>
    </div>
    <div v-if="page === 'cart'">
      <Cart
        @removeFromCart="removeFromCart($event)"
        @submitQty="submitQty($event)"
        @checkout="checkout"
        :cart="cart"
        :availableItems="availableItems"
        :card_no="card_no"
      />
    </div>
    <div v-if="page === 'items'">
      <Items
        @getItems="getItems"
        @addToCart="addToCart"
        :cart="cart"
        :items="items"
        :books="books"
        :movies="movies"
        :availableItems="availableItems"
        :databaseReloaded="databaseReloaded"
        :card_no="card_no"
      />
    </div>
    <!-- update the next field and add functionality to create the visuals for user profile -->
    <div v-if="page === 'events'">
      <Events :events="events" />
    </div>
  </div>
</template>

<script>
import Items from "./Items.vue";
import Cart from "./Cart.vue";
import Events from "./Events.vue";
import RegisterEventModal from "../Components/RegisterEventModal.vue";
import ViewRegisteredModal from "../Components/ViewRegisteredModal.vue";
import {
  getUserLoanedItems,
  returnItemAPI,
  getRegisteredEvent,
  getUserHoldItems,
  unregisterFromEvent,
  getUserByID,
} from "../services/apiServices";

export default {
  //name: "UserProfile",
  data() {
    return {
      card_no: this.$route.params.card_no,
      name: "",
      page: "userprofile",
      cart: [], //contains unique values with copies_in_cart attrib
      cart_count: 0, //actual number of items in cart != this.cart.length
      items: [],
      books: [],
      movies: [],
      events: [],
      availableItems: [],
      databaseReloaded: true,
      userEvents: [],
      loanedItems: [],
      holds: [],
      eventDisplay: null,
      loanDisplay: null,
      holdDisplay: null,
    };
  },
  methods: {
    async getUserEvents() {
      await getRegisteredEvent(this.card_no).then((response) => {
        if (response.status == 200) {
          var allEvents = response.data;

          for (let i in allEvents) {
            var event = {
              id: allEvents[i]["event_id"],
              name: allEvents[i]["event_name"],
              start_date: allEvents[i]["event_start_date"],
              end_date: allEvents[i]["end_date"],
              start_time: allEvents[i]["start_time"],
              end_time: allEvents[i]["end_time"],
              location: allEvents[i]["e_location"],
            };
            this.userEvents.push(event);
          }
        }
      });
    },
    async getUserByID() {
      await getUserByID(this.card_no).then((response) => {
        this.name = response.data.name;
      });
    },
    async getLoanedItems() {
      await getUserLoanedItems(this.card_no).then((response) => {
        if (response.status == 200) {
          var objects = response.data;

          for (let i in objects) {
            var obj = {
              item_id: objects[i]["item_id"],
              item_name: objects[i]["item_name"],
              release_date: objects[i]["release_date"],
              item_desc: objects[i]["item_desc"],
              item_barcode: objects[i]["item_barcode"],
              checkout_date: objects[i]["checkout_date"],
              return_date: objects[i]["return_date"],
              //shortened title
              short_name: objects[i]["item_name"].split(":")[0],
            };
            this.loanedItems.push(obj);
          }
        }
      });
    },

    async unregisterEvent(event_id) {
      console.log(event_id);
      await unregisterFromEvent(this.card_no, event_id).then((response) => {
        if (response.status == 200) {
          var result = response.data;
          console.log(result.message);
        }
      });
      this.userEvents = [];
      this.getUserEvents();
    },

    async returnItem(item_barcode) {
      console.log("test " + item_barcode);
      await returnItemAPI(this.card_no, item_barcode).then((response) => {
        if (response.status == 200) {
          this.showModal = false;
          if (response.data.status == 400) {
            this.errormessage = response.data.message;
          }
        }
      });
      //this.loanedItems.splice(index, 1);
      this.loanedItems = [];
      this.getLoanedItems(); //better to just reload data
    },

    removeHold() {},

    async getHolds() {
      await getUserHoldItems(this.card_no).then((response) => {
        if (response.status == 200) {
          var objects = response.data;

          for (let i in objects) {
            var obj = {
              item_id: objects[i]["item_id"],
              item_name: objects[i]["item_name"],
              release_date: objects[i]["release_date"],
              item_desc: objects[i]["item_desc"],
              hold_position: objects[i]["hold_position"],
              //shortened title
              short_name: objects[i]["item_name"].split(":")[0],
            };
            this.holds.push(obj);
          }
        }
      });
    },
    getItems() {
      this.databaseReloaded = false;
    },
    addToCart(item) {
      //console.log("from item:" + item.copies);
      var ids = [];
      for (let i = 0; i < this.cart.length; i++) {
        ids.push(this.cart[i].item_id);
      }
      if (!ids.includes(item.item_id)) {
        this.cart.push(item);
      }
      this.cart_count += 1;
      //console.log(this.cart);
    },
    removeFromCart(item) {
      //console.log(item.copies + " + " + item.copies_in_cart);
      item.copies += item.copies_in_cart;
      //console.log(" = " + item.copies);
      this.cart_count -= item.copies_in_cart;
      item.copies_in_cart = 0;
      this.cart.splice(this.cart.indexOf(item), 1);
    },
    submitQty(diff) {
      this.cart_count -= diff;
    },
    checkout() {
      this.databaseReloaded = true;
      this.cart = [];
      this.cart_count = 0;
      this.items = [];
      this.books = [];
      this.movies = [];
      //these are items that are initially available in db
      this.availableItems = [];
    },
    goToCart() {
      this.page = "cart";
    },
    goToItems() {
      this.page = "items";
    },
    goToEvents() {
      this.page = "events";
    },
    goToProfile() {
      this.userEvents = [];
      this.loanedItems = [];
      this.holds = [];
      this.getUserEvents();
      this.getLoanedItems();
      this.getHolds();
      this.page = "userprofile";
    },
    signOut() {
      this.$router.push("/");
    },
    registerEvent() {
      this.$refs.registereventmodal.show();
    },
    viewRegisteredEvents() {
      this.$refs.viewregisteredmodal.show();
    },
  },
  mounted: function () {
    this.getUserEvents();
    this.getLoanedItems();
    this.getHolds();
    this.getUserByID();
  },
  components: { Items, Cart, Events, RegisterEventModal, ViewRegisteredModal },
};
</script>

<style scoped>
body {
  margin: 0;
}
.items {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
header {
  height: 108px;
  background-color: rgb(245, 148, 78);
  text-align: right;
  font-size: 20px;
  padding-top: 20px;
}
</style>
