<template>
	<div>
		<h1>Your Cart</h1>
		<div class="items">
			<div v-for="(item, index) in cart" :key="index">
				<h3>{{ item.name }}</h3>
				<img :src="item.image" />
				<div>
					<v-btn color="error" class="mr-4" @click="removeFromCart(item)">
						Remove from cart
					</v-btn>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: ["cart"],
	methods: {
		removeFromCart(item) {
			this.$emit("removeFromCart", item);
		},
	},
};
</script>

<style scoped></style>
