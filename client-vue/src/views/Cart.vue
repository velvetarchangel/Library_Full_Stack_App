<template>
	<div>
		<!--<h1>Your Cart</h1>
		<div class="items">
			<div v-for="(item, index) in cart" :key="index">
				<h3>{{ item.item_name }}</h3>
				<img :src="item.image" />
				<div>
					<v-btn color="error" class="mr-4" @click="removeFromCart(item)">
						Remove from cart
					</v-btn>
				</div>
			</div>
		</div>-->
		<div class="items">
			<v-card flat class="ma-7" max-width="1450">
				<h4 class="display-1">Your Cart</h4>
			</v-card>
			<div v-if="!this.cart.length">
				<v-card outlined class="mx-auto" max-width="1450" height="100">
					<v-card-text class="text-center"> Your cart is empty! </v-card-text>
				</v-card>
			</div>
			<div v-else>
				<div v-for="(item, index) in cart" :key="index">
					<v-card outlined class="mx-auto" max-width="1450">
						<v-card-title>
							{{ item.item_name }}
						</v-card-title>
						<div class="grey--text ms-4">
							{{ item.item_type }}, {{ item.release_date }}
						</div>
						<v-card-text>
							{{ item.item_desc }}
						</v-card-text>
						<!--<p class="subheading .font-weight-medium ms-3">
						Item Barcode: {{ item.barcode }}
					</p>
					<v-responsive max-width="50" class="ml-7">
						<v-text-field
							type="number"
							label="Quantity"
							min="0"
							max="10"
						></v-text-field>
					</v-responsive>-->
						<v-card-actions>
							<div class="ma-7">
								<v-menu offset-y>
									<template v-slot:activator="{ on, attrs }">
										<v-row>
											<v-btn
												outlined
												elevation="1"
												color="grey darken-2"
												v-bind="attrs"
												v-on="on"
											>
												Qty: {{ item.copies_in_cart }}
												<v-icon>{{
													item.show ? "mdi-chevron-up" : "mdi-chevron-down"
												}}</v-icon>
											</v-btn>
											<v-btn
												class="ml-2"
												outlined
												elevation="1"
												color="grey darken-2"
												@click="removeFromCart(item)"
											>
												Remove From Cart
											</v-btn>
										</v-row>
									</template>
									<v-list>
										<v-list-item
											v-for="(i, index) in item.copies + item.copies_in_cart"
											:key="index"
											@click="submitQty(i, item)"
										>
											<v-list-item-title>{{ i }}</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>
						</v-card-actions>
					</v-card>
				</div>
			</div>
			<v-card flat>
				<v-card-text>
					<v-container>
						<v-col cols="10" sm="5">
							<v-checkbox
								label="I would like to borrow these items from a specific branch."
								:disabled="!this.cart.length"
								color="red"
								hide-details
								@click="notInBranch = !notInBranch"
							></v-checkbox>
							<v-select
								class="mt-2"
								v-model="branch"
								outlined
								:items="this.branches"
								label="Select a branch"
								:disabled="notInBranch == false"
								hint="*Required"
							></v-select>
						</v-col>
						<div class="text-center">
							<v-btn
								rounded
								color="amber lighten-1"
								:disabled="
									!this.cart.length || (this.notInBranch && this.branch == 0)
								"
								@click="checkout()"
							>
								Proceed to Checkout
							</v-btn>
						</div>
					</v-container>
				</v-card-text>
			</v-card>
		</div>
	</div>
</template>

<script>
export default {
	props: ["cart", "cart_count"],
	data() {
		return {
			notInBranch: false,
			branches: [1234, 1235, 1236],
			branch: 0,
		};
	},
	methods: {
		removeFromCart(item) {
			this.$emit("removeFromCart", item);
		},
		submitQty(i, item) {
			// Get difference between old and new item qty values
			let init_copies_in_cart = item.copies_in_cart; //old val
			item.copies_in_cart = i; //new val
			let difference = init_copies_in_cart - i;

			item.copies += difference;
			this.$emit("submitQty", difference);

			//console.log("cart says:" + item.copies);
		},
		checkout() {},
		log() {
			//this.branch = item;
			console.log(this.branch);
		},
	},
	mounted: function () {
		//this.log();
	},
};
</script>

<style scoped></style>
