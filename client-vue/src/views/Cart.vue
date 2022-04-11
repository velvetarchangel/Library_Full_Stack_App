<template>
	<div>
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
								@click="inBranch = !inBranch"
							></v-checkbox>
							<v-select
								class="mt-2"
								v-model="branch"
								outlined
								:items="this.branchNames"
								label="*Select a branch"
								:disabled="inBranch == false"
								hint="Required"
							></v-select>
						</v-col>
						<div class="text-center">
							<v-btn
								rounded
								color="amber lighten-1"
								:disabled="
									!this.cart.length || (this.inBranch && this.branch == 0)
								"
								@click="proceedCheckout()"
							>
								Proceed to Checkout
							</v-btn>
							<v-dialog
								v-model="this.unavailableAlert"
								persistent
								max-width="400"
							>
								<v-card>
									<v-card-title class="text-h5"> Uh oh! </v-card-title>
									<v-card-text v-html="unavailability"></v-card-text>
									<v-card-actions>
										<v-spacer></v-spacer>
										<v-btn color="green darken-1" text @click="resetFields()">
											No
										</v-btn>
										<v-btn color="green darken-1" text @click="checkout()">
											Yes
										</v-btn>
									</v-card-actions>
								</v-card>
							</v-dialog>
						</div>
					</v-container>
				</v-card-text>
				<v-alert
					:value="this.checkoutSuccess"
					class="mx-auto text-center"
					transition="fade-transition"
					color="green"
					outlined
					prominent
					type="success"
					width="400"
					>Success! Thank you! Navigate to your profile to check your borrowed
					items.</v-alert
				>
				<v-alert
					:value="this.hasFail"
					class="mx-auto text-center"
					transition="fade-transition"
					border="right"
					colored-border
					type="error"
					elevation="2"
					><span v-html="unavailability"></span>
				</v-alert>
			</v-card>
		</div>
	</div>
</template>

<script>
import { createSignedOutObject, getBranches } from "../services/apiServices";
export default {
	props: ["cart", "cart_count", "availableItems", "card_no"],
	data() {
		return {
			inBranch: false,
			branches: [],
			branchNames: [],
			branch: "",
			branchString: "",
			unavailableItems: [],
			unavailableInBranch: [],
			unavailability: "",
			unavailableAlert: false,
			itemsToCheckout: [],
			checkoutSuccess: false,
			failCheckouts: [],
			hasFail: false,
		};
	},
	methods: {
		async getAllBranches() {
			await getBranches().then((response) => {
				if (response.status == 200) {
					var all_branches = response.data;

					for (let i in all_branches) {
						var branch = {
							branch_id: all_branches[i]["branch_id"],
							branch_name: all_branches[i]["branch_name"],
							branch_address: all_branches[i]["branch_address"],
						};
						this.branches.push(branch);
						this.branchNames.push(branch.branch_name);
					}
				}
			});
		},
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
		proceedCheckout() {
			for (let i = 0; i < this.cart.length; i++) {
				let item = this.cart[i];
				for (let j = 0; j < item.copies_in_cart; j++) {
					var branchId = 0;
					var branchlist = [];
					var availableHere = [];

					for (let k = 0; k < this.availableItems.length; k++) {
						// get random branch
						if (this.availableItems[k].item_id == item.item_id) {
							if (this.availableItems[k].item_availability == 1) {
								availableHere.push(this.availableItems[k].branch_id);
							}
							branchlist.push(this.availableItems[k].branch_id);
						}
					}

					// If user prefer to checkout from a specific branch
					if (this.inBranch) {
						// Get id of selected branch
						for (let b in this.branches) {
							if (this.branches[b]["branch_name"] == this.branch) {
								branchId = this.branches[b]["branch_id"];
							}
						}
						var thisItem = {
							item: item,
							branchId: branchId,
						};

						this.itemsToCheckout.push(thisItem);

						if (!availableHere.includes(branchId)) {
							this.getUnavailableItem(item, "at " + this.branch);
						}
					} else {
						// If user does not have a branch preference
						// get random branch
						if (availableHere.length > j) {
							branchId = availableHere[j];
						} else {
							this.getUnavailableItem(item, "in any branch");
						}
						var thatItem = {
							item: item,
							branchId: branchId,
						};
						this.itemsToCheckout.push(thatItem);
					}
				}
			}

			if (this.unavailableItems.length > 0) {
				// Generate unavailability alert string
				this.unavailability =
					"It looks like the following item(s) are unavailable " +
					this.branchString +
					":<br />";
				for (let i = 0; i < this.unavailableInBranch.length; i++) {
					this.unavailability +=
						"<br/>" +
						this.unavailableInBranch[i].copy +
						" copy(s) of " +
						this.unavailableInBranch[i].name;
				}
				this.unavailability += "<br/><br/>Would you still like to proceed?";
				this.unavailableAlert = true;
			} else {
				this.checkout();
			}
		},
		getUnavailableItem(item, branchName) {
			this.branchString = branchName;
			if (
				!this.unavailableItems.length ||
				!this.unavailableItems.includes(item.item_name)
			) {
				let someItem = {
					name: item.item_name,
					copy: 1,
					//branch: branchName,
				};
				this.unavailableInBranch.push(someItem);
				this.unavailableItems.push(item.item_name);
			} else {
				for (let u in this.unavailableItems) {
					if (this.unavailableItems[u] == item.item_name) {
						this.unavailableInBranch[u]["copy"] += 1;
					}
				}
			}
		},
		async checkout() {
			this.unavailableAlert = false;
			this.unavailability =
				"Sorry, we were unable to checkout the following item(s):<br/>";
			let user = {
				card_no: this.card_no,
			};
			for (let x = 0; x < this.itemsToCheckout.length; x++) {
				let item = this.itemsToCheckout[x].item;
				let branchId = this.itemsToCheckout[x].branchId;
				await createSignedOutObject(user, item.item_id, branchId).then(
					(response) => {
						if (response.status == 200) {
							var object = response.data;
							if (object.status == 400) {
								this.failCheckouts.push(item.item_name);
								this.unavailability += item.item_name + "<br/>";
							}
						}
					}
				);
			}

			//console.log(this.failCheckouts);

			// Show success/fail alerts
			if (this.cart.length != this.failCheckouts.length) {
				this.checkoutSuccess = true;
				window.setInterval(() => {
					this.checkoutSuccess = false;
				}, 20000);
			}
			if (this.failCheckouts.length > 0) {
				this.hasFail = true;
				window.setInterval(() => {
					this.hasFail = false;
				}, 20000);
			}

			this.$emit("checkout");
		},
		resetFields() {
			this.unavailableItems = [];
			this.unavailableInBranch = [];
			this.unavailability = "";
			this.unavailableAlert = false;
			this.itemsToCheckout = [];
		},
	},
	mounted: function () {
		this.getAllBranches();
	},
};
</script>

<style scoped></style>
