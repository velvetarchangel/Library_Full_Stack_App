<template>
	<div>
		<header>
			{{ cart.length }} ITEMS IN CART
			<v-btn class="ma-2" color="secondary" @click="signOut"> Sign Out </v-btn>
			<div v-if="page === 'userprofile'">
				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToItems()"
					>Browse Items</v-btn
				>
				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToCart()"
					>View Cart</v-btn
				>
			</div>
			<div v-if="page === 'cart'">
				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToItems()"
					>Browse Items</v-btn
				>
				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToProfile()"
					>Back To Profile</v-btn
				>
			</div>
			<div v-if="page === 'items'">
				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToCart()"
					>View Cart</v-btn
				>
				<v-btn color="blue-grey lighten-5" class="mr-4" @click="goToProfile()"
					>Back To Profile</v-btn
				>
			</div>
		</header>
		<div v-if="page === 'userprofile'">
			User profile for user {{ this.card_no }}
		</div>
		<div v-if="page === 'cart'">
			<Cart @removeFromCart="removeFromCart($event)" :cart="cart" />
		</div>
		<div v-if="page === 'items'">
			<Items @addToCart="addToCart" />
		</div>
	</div>
</template>

<script>
import Items from "./Items.vue";
import Cart from "./Cart.vue";

export default {
	//name: "UserProfile",
	data() {
		return {
			card_no: this.$route.params.card_no,
			page: "userprofile",
			cart: [],
			errormessage: "",
		};
	},
	methods: {
		addToCart(item) {
			this.cart.push(item);
			console.log(this.cart);
		},
		removeFromCart(item) {
			this.cart.splice(this.cart.indexOf(item), 1);
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
	height: 65px;
	box-shadow: 2px 2px 5px rgb(206, 183, 171);
	background-color: rgb(245, 148, 78);
	text-align: right;
	font-size: 20px;
	padding-top: 20px;
}
</style>
