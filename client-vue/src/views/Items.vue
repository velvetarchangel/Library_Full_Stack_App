<template>
	<div>
		<div class="items">
			<v-tabs>
				<v-tab @click="goToTab('items')">All Items</v-tab>
				<v-tab @click="goToTab('books')">Books</v-tab>
				<v-tab @click="goToTab('movies')">Movies</v-tab>
			</v-tabs>
			<v-container class="my-5">
				<v-layout row wrap>
					<v-flex xs12 sm6 md4 lg3 v-for="(item, index) in array" :key="index">
						<v-card class="text-xs-center ma-1" max-width="380">
							<!--<v-img
								src="https://cdn.diys.com/wp-content/uploads/2018/02/Pale-yellow-with-blues.jpg"
								height="200px"
							></v-img>-->
							<div v-if="item.show === false">
								<v-card-title>{{ item.short_name }}</v-card-title>
							</div>
							<div v-if="item.show === true">
								<v-card-title>{{ item.item_name }}</v-card-title>
							</div>
							<div v-if="tab === 'items'">
								<div class="grey--text ms-4">
									{{ item.item_type }}, {{ item.release_date }}
								</div>
							</div>
							<div v-else>
								<div class="grey--text ms-4">{{ item.release_date }}</div>
							</div>

							<v-card-actions>
								<v-btn
									:disabled="item.copies == 0"
									color="orange lighten-2"
									text
									@click="addToCart(item)"
									>Add To Cart
								</v-btn>
								<v-btn
									:disabled="item.copies > 0"
									color="blue"
									text
									@click="inquireHold(item)"
									>Place Hold</v-btn
								>

								<v-overlay :absolute="absolute" :value="item.inquireHold">
									<v-card class="text-center ma-3">
										<v-card-text v-html="holdInquiryString"></v-card-text>
										<v-card-actions>
											<v-spacer></v-spacer>
											<v-btn
												color="green lighten-1"
												text
												@click="item.inquireHold = false"
											>
												No
											</v-btn>
											<v-btn
												color="green lighten-1"
												text
												@click="placeHold(item)"
											>
												Yes
											</v-btn>
										</v-card-actions>
									</v-card>
								</v-overlay>

								<v-spacer></v-spacer>

								<v-btn icon @click="item.show = !item.show">
									<v-icon>{{
										item.show ? "mdi-chevron-up" : "mdi-chevron-down"
									}}</v-icon>
								</v-btn>
							</v-card-actions>

							<v-expand-transition>
								<div v-show="item.show">
									<v-divider></v-divider>
									<v-card-text>
										{{ item.item_desc }}
									</v-card-text>
								</div>
							</v-expand-transition>
						</v-card>
					</v-flex>
					<v-alert
						:value="this.addToCartSuccess"
						dense
						elevation="4"
						transition="fade-transition"
						>Item added to cart!</v-alert
					>
					<v-alert
						:value="holdProcessed"
						elevation="4"
						transition="fade-transition"
						>{{ this.holdStat }}</v-alert
					>
				</v-layout>
			</v-container>
		</div>
	</div>
</template>

<script>
import {
	getAllItems,
	getAvailableItems,
	getAllHolds,
	createHoldRecord,
} from "../services/apiServices";
export default {
	name: "Items",
	//This is where item data properties will be
	props: [
		"card_no",
		"cart",
		"items",
		"books",
		"movies",
		"availableItems",
		"databaseReloaded",
	],
	data() {
		return {
			//items: [],
			//books: [],
			//movies: [],
			//availableItems: [],
			addToCartSuccess: false,
			holdProcessed: false,
			tab: "items",
			array: this.items,
			holdsInDB: [],
			absolute: true,
			holdInquiryString: "",
			holdStat: "",
		};
	},
	methods: {
		async getItems() {
			if (!this.cart.length && this.databaseReloaded) {
				//console.log("oops i did it again");
				await getAllItems().then((response) => {
					if (response.status == 200) {
						var objects = response.data;

						for (let obj in objects) {
							// Shorten long titles
							var title = objects[obj]["item_name"];
							var short_title = "";
							if (title.length > 21) {
								for (let i = 0; i < 21; i++) {
									short_title = short_title + title[i];
								}
								short_title = short_title + "...";
							} else {
								short_title = title;
							}

							var item = {
								show: false,
								copies: 0,
								copies_in_cart: 0,
								item_type: objects[obj]["item_type"],
								item_id: objects[obj]["item_id"],
								short_name: short_title,
								item_name: title,
								release_date: objects[obj]["release_date"],
								item_desc: objects[obj]["item_desc"],
								item_availability: objects[obj]["item_availability"],
								inquireHold: false,
							};
							if (objects[obj]["item_type"] == "Book") {
								this.books.push(item);
								this.items.push(item);
							} else if (objects[obj]["item_type"] == "Movie") {
								this.movies.push(item);
								this.items.push(item);
							}
						}
					}
				});

				await getAvailableItems().then((response) => {
					if (response.status == 200) {
						var objects = response.data;

						for (let obj in objects) {
							var item = {
								item_id: objects[obj]["item_id"],
								item_barcode: objects[obj]["item_barcode"],
								item_availability: objects[obj]["item_availability"],
								branch_id: objects[obj]["branch_id"],
							};
							this.availableItems.push(item);
						}
					}
				});

				for (let i = 0; i < this.items.length; i++) {
					for (let j = 0; j < this.availableItems.length; j++) {
						if (
							this.items[i].item_id == this.availableItems[j].item_id &&
							this.availableItems[j].item_availability == 1
						) {
							this.items[i].copies += 1;
							//this.items[i].barcode.push(this.availableItems[j].item_barcode);
						}
					}
				}
				this.$emit("getItems");
				//console.log(this.items);
				//this.hasBeenVisited = true;
				//this.itemsPageInitialized = true;
			}
		},
		async getHolds() {
			await getAllHolds().then((response) => {
				if (response.status == 200) {
					var objects = response.data;

					for (let obj in objects) {
						var item = {
							card_no: objects[obj]["card_no"],
							item_id: objects[obj]["item_id"],
							hold_position: objects[obj]["hold_position"],
						};
						this.holdsInDB.push(item);
					}
				}
			});
		},
		goToTab(string) {
			if (string === "items") {
				this.tab = string;
				this.array = this.items;
			} else if (string === "books") {
				this.tab = string;
				this.array = this.books;
			} else if (string === "movies") {
				this.tab = string;
				this.array = this.movies;
			}
		},
		goToCart() {
			this.$router.push("/cart");
		},
		addToCart(item) {
			this.$emit("addToCart", item);
			item.copies -= 1;
			item.copies_in_cart += 1;
			//console.log("items says:" + item.copies_in_cart);
			this.addToCartSuccess = true;
			window.setInterval(() => {
				this.addToCartSuccess = false;
			}, 3000);
		},
		inquireHold(item) {
			item.inquireHold = true;
			var holdsOfItem = [];
			for (let i = 0; i < this.holdsInDB.length; i++) {
				if (this.holdsInDB[i].item_id == item.item_id) {
					holdsOfItem.push(item);
				}
			}

			// Generate string for hold inquiry
			this.holdInquiryString =
				"Your place in the waiting list will be: " +
				holdsOfItem.length +
				"<br/> Put this item on hold?";
		},
		async placeHold(item) {
			await createHoldRecord(item.item_id, this.card_no).then((response) => {
				if (response.status == 200) {
					var object = response.data;
					console.log(object);

					if (object.status == 400) {
						this.holdStat += response.data.message;
					} else if (object[0].item_id == item.item_id) {
						this.holdStat = "Item successfully put on hold!";
					} else {
						this.holdStat =
							"Sorry, we were unable to put this item on hold for you.";
					}
				}
			});

			item.inquireHold = false;
			this.holdProcessed = true;
			window.setInterval(() => {
				this.holdProcessed = false;
				this.holdStat = "";
			}, 6000);
		},
	},
	mounted: function () {
		this.getItems();
		this.getHolds();
		this.goToTab("items");
	},
};
</script>

<style scoped>
.v-alert {
	position: fixed;
	left: 50%;
	top: 50px;
	transform: translate(-50%, -50%);
	margin: 0 auto;
}
</style>
