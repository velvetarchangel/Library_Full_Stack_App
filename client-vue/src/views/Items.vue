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
									@click="placeHold()"
									>Place Hold</v-btn
								>

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
						:value="this.value"
						dense
						elevation="4"
						transition="fade-transition"
						>Item added to cart!</v-alert
					>
				</v-layout>
			</v-container>
		</div>
	</div>
</template>

<script>
import { getAllItems, getAvailableItems } from "../services/apiServices";
export default {
	name: "Items",
	//This is where item data properties will be
	props: ["cart", "items", "books", "movies", "availableItems"],
	data() {
		return {
			//items: [],
			//books: [],
			//movies: [],
			//availableItems: [],
			value: false,
			tab: "items",
			array: this.items,
		};
	},
	methods: {
		async getItems() {
			if (!this.cart.length) {
				//console.log("oops i did it again");
				await getAllItems().then((response) => {
					if (response.status == 200) {
						var objects = response.data;

						// Shorten long titles
						for (let obj in objects) {
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
								//barcodes: [],
								item_type: objects[obj]["item_type"],
								item_id: objects[obj]["item_id"],
								short_name: short_title,
								item_name: title,
								release_date: objects[obj]["release_date"],
								item_desc: objects[obj]["item_desc"],
								item_availability: objects[obj]["item_availability"],
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
						if (this.items[i].item_id == this.availableItems[j].item_id) {
							this.items[i].copies += 1;
							//this.items[i].barcode.push(this.availableItems[j].item_barcode);
						}
					}
				}
				//console.log(this.items);
				//this.hasBeenVisited = true;
				//this.itemsPageInitialized = true;
			}
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
			this.value = true;
			window.setInterval(() => {
				this.value = false;
			}, 3000);
		},
		placeHold() {},
		/*		log() {
			console.log(this.cart_count);
		},
*/
	},
	mounted: function () {
		//this.log();
		this.getItems();
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
