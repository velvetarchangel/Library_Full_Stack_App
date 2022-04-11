<template>
	<div>
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
			</div>
			<div v-if="page === 'cart'">
				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToItems()"
					><v-icon small left>mdi-bookshelf</v-icon>Browse Items</v-btn
				>
				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToProfile()"
					><v-icon small left>mdi-account</v-icon>Back To Profile</v-btn
				>
			</div>
			<div v-if="page === 'items'">
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
				<h2 class="text-button ma-4">Welcome back!<br /></h2>
				<v-sheet class="mx-auto" elevation="8" max-width="1100">
					<h2 class="text-button ma-4">
						Check out these events going on at our locations!
					</h2>
					<v-slide-group
						v-model="eventDisplay"
						class="pa-4"
						active-class="success"
						show-arrows
					>
						<v-slide-item
							v-for="(event, index) in this.events"
							:key="index"
							v-slot="{ active, toggle }"
						>
							<v-card
								:color="active ? undefined : 'grey lighten-1'"
								img="https://calgarylibrary.ca/assets/Central/communitylivingroom720x560__ScaleMaxWidthWzE4MDBd.jpg"
								class="ma-4"
								height="200"
								width="300"
								@click="toggle"
							>
								<v-col class="fill-height" align="center" justify="center">
									<v-card-title primary-title class="justify-center">
										<v-spacer />
										<div class="text-center">
											<h1 class="font-weight-light">{{ event }}</h1>
											<v-card-text class="text-caption">Date: </v-card-text>
										</div>
										<v-spacer
									/></v-card-title>

									<v-row class="fill-height" align="center" justify="center">
										<v-scale-transition>
											<v-btn
												v-if="active"
												color="orange"
												size="48"
												@click="registerForEvent()"
												>Register for Event</v-btn
											>
										</v-scale-transition>
									</v-row>
								</v-col>
							</v-card>
						</v-slide-item>
					</v-slide-group>
					<v-expand-transition>
						<v-sheet v-if="eventDisplay != null" height="200" tile>
							<v-row class="fill-height" align="center" justify="center">
								<h3 class="text-h6">
									{{ this.events[eventDisplay] }}
								</h3>
								<v-card-text class="text-center">description</v-card-text>
							</v-row>
						</v-sheet>
					</v-expand-transition>

					<v-card-text>
						<div class="text-caption ml-8 mb-2">Events you registered for:</div>

						<v-timeline align-top dense>
							<v-timeline-item
								v-for="event in this.userEvents"
								:key="event"
								color="purple"
								small
							>
								<div>
									<div class="font-weight-normal">
										<strong>Event name</strong> @location
									</div>
									<div>Date, from this time to that time</div>
									<v-btn text color="grey" @click="unregisterForEvent()"
										>Unregister for this event</v-btn
									>
								</div>
							</v-timeline-item>
						</v-timeline>
					</v-card-text>

					<h2 class="text-button ma-4">Your borrowed items:</h2>
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

									<v-row class="fill-height" align="center" justify="center">
										<v-scale-transition>
											<v-btn
												v-if="active"
												color="yellow"
												size="48"
												@click="returnItem()"
												>Return Item</v-btn
											>
										</v-scale-transition>
									</v-row>
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

					<h2 class="text-button ma-4">Items you put on hold:</h2>
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
											<h1 class="font-weight-light">{{ item }}</h1>
											<v-card-text class="text-caption">Date: </v-card-text>
										</div>
										<v-spacer
									/></v-card-title>

									<v-row class="fill-height" align="center" justify="center">
										<v-scale-transition>
											<v-btn
												v-if="active"
												color="blue"
												size="48"
												@click="removeHold()"
												>Remove Hold</v-btn
											>
										</v-scale-transition>
									</v-row>
								</v-col>
							</v-card>
						</v-slide-item>
					</v-slide-group>
					<v-expand-transition>
						<v-sheet v-if="holdDisplay != null" height="200" tile>
							<v-row class="fill-height" align="center" justify="center">
								<h3 class="text-h6">
									{{ this.holds[holdDisplay] }}
								</h3>
								<v-card-text class="text-center">description</v-card-text>
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
			/>
		</div>
	</div>
</template>

<script>
import Items from "./Items.vue";
import Cart from "./Cart.vue";
import { getUserLoanedItems } from "../services/apiServices";

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
			userEvents: [1, 2, 3], //temp
			events: [0, 1, 2], //temp
			loanedItems: [],
			holds: [1, 2, 3], // temp
			eventDisplay: null,
			loanDisplay: null,
			holdDisplay: null,
		};
	},
	methods: {
		async getEvents() {},
		async getLoanedItems() {
			await getUserLoanedItems(this.card_no).then((response) => {
				if (response.status == 200) {
					var objects = response.data;

					for (let i in objects) {
						var obj = {
							item_id: objects[i]["item_id"],
							item_name: objects[i]["item_name"],
							//shorten title
							short_name: objects[i]["item_name"].split(":")[0],
							release_date: objects[i]["release_date"],
							item_desc: objects[i]["item_desc"],
							item_barcode: objects[i]["item_barcode"],
							checkout_date: objects[i]["checkout_date"],
							return_date: objects[i]["return_date"],
						};
						this.loanedItems.push(obj);
					}
				}
			});
		},
		async getHolds() {},
		registerForEvent() {},
		unregisterForEvent() {},
		returnItem() {},
		removeHold() {},
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
		goToProfile() {
			this.page = "userprofile";
		},
		signOut() {
			this.$router.push("/");
		},
	},
	mounted: function () {
		this.getEvents();
		this.getLoanedItems();
		this.getHolds();
	},
	components: { Items, Cart },
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
