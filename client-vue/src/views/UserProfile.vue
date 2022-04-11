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
					><v-icon small left>mdi-cart</v-icon>Browse Events</v-btn
				>
			</div>
			<div v-if="page === 'cart'">
				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToItems()"
					><v-icon small left>mdi-bookshelf</v-icon>Browse Items</v-btn
				>

				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToEvents()"
					><v-icon small left>mdi-cart</v-icon>Browse Events</v-btn
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
					><v-icon small left>mdi-cart</v-icon>Browse Events</v-btn
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
			User profile for user {{ this.card_no }}
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
			/>
		</div>
		<!-- update the next field and add functionality to create the visuals for user profile -->
		<div v-if="page === 'events'"> 
			<Events
				@getItems="getItems"
				@addToCart="addToCart"
				:cart="cart"
				:events="events"
				:items="items"
				:books="books"
				:movies="movies"
				:availableItems="availableItems"
				:databaseReloaded="databaseReloaded"
			/>
		</div>
	</div>
</template>

<script>
import Items from "./Items.vue";
import Cart from "./Cart.vue";
import Events from "./Events.vue";
import RegisterEventModal from "../Components/RegisterEventModal.vue";
import ViewRegisteredModal from "../Components/ViewRegisteredModal.vue";
export default {
	//name: "UserProfile",
	
	data() {
		return {
			card_no: this.$route.params.card_no,
			page: "userprofile",
			cart: [], //contains unique values with copies_in_cart attrib
			cart_count: 0, //actual number of items in cart != this.cart.length
			items: [],
			books: [],
			movies: [],
			availableItems: [],
			databaseReloaded: true,
		};
	},
	methods: {
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
		/*		log() {
			console.log(this.cart_count);
		},
	},
	mounted: function () {
		this.log();
*/
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