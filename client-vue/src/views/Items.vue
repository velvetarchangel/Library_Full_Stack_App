<template>
	<div>
		<h1>Hello there! Here are some items</h1>
		<div class="items">
			<!-- this iterates over a list of things
       i.e., for item in items... 
       
       **later maybe try to iterate over data in database?-->
			<div v-for="(item, index) in items" :key="index">
				<h3>{{ item.name }}</h3>
				<img :src="item.image" />
				<div>{{ item.availability }}</div>
				<v-btn color="error" class="mr-4" @click="addToCart(item)">
					Add to cart
				</v-btn>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Items",
	data: () => {
		return {
			//This is where data properties will be

			//Below are simple temporary data examples
			items: [
				//this is an array
				{
					name: "Some Book",
					availability: "5 copies",
					image:
						"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ95nMcjiQq-H5ZGc8aUJQd5h97fKwgN6wbQQ&usqp=CAU",
				},
				{
					name: "Some Movie",
					availability: "1 copy",
					image:
						"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnaA-E4dWfGl0blYmpjXc3jtwoNSohvzpR0Q&usqp=CAU",
				},
			],
		};
	},
	methods: {
		goToCart() {
			this.$router.push("/cart");
		},
		addToCart(item) {
			this.$emit("addToCart", item);
			//console.log(item);
		},
	},
};
</script>

<style scoped></style>
