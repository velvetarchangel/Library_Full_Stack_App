<template>
  <div>
    <div>User profile for user {{ this.customer_card }}</div>
    <div>Librarian profiles is {{ this.admin_card }}</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      customer_card: this.$route.params.customer_card,
      admin_card: this.$route.params.admin_card,
    };
  },
};
</script>
