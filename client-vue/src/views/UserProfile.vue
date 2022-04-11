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
						v-model="model"
						class="pa-4"
						active-class="success"
						show-arrows
					>
						<v-slide-item v-for="n in 15" :key="n" v-slot="{ active, toggle }">
							<v-card
								:color="active ? undefined : 'grey lighten-1'"
								class="ma-4"
								height="200"
								width="300"
								@click="toggle"
							>
								<v-row class="fill-height" align="center" justify="center">
									<v-scale-transition>
										<v-icon
											v-if="active"
											color="white"
											size="48"
											v-text="'mdi-close-circle-outline'"
										></v-icon>
									</v-scale-transition>
								</v-row>
							</v-card>
						</v-slide-item>
					</v-slide-group>
					<h2 class="text-button ma-4">Your borrowed items:</h2>
					<v-slide-group
						v-model="display"
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
								class="ma-4"
								height="200"
								width="300"
								@click="toggle"
							>
								<h1 class="font-weight-light">{{ item.item_name }}</h1>
								<v-row class="fill-height" align="center" justify="center">
									<v-scale-transition>
										<v-icon
											v-if="active"
											color="white"
											size="48"
											v-text="'mdi-close-circle-outline'"
										></v-icon>
									</v-scale-transition>
								</v-row>
							</v-card>
						</v-slide-item>
					</v-slide-group>
					<v-expand-transition>
						<v-sheet v-if="display != null" height="200" tile>
							<v-row class="fill-height" align="center" justify="center">
								<h3 class="text-h6">Selected {{ model }}</h3>
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
			userEvents: [],
			events: [],
			loanedItems: [],
			holds: [],
			model: null, //temporary
			display: null,
			recordHeads: [
				//temporary

				"Items you put on hold:",
				"Events you're registered for:",
			],
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
