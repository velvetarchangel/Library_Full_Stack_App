<template>
  <div>User profile for the librarian is {{ this.card_no }}</div>
</template>
<script>
export default {
  data() {
    return {
      card_no: this.$route.params.card_no,
    };
  },
};
</script>
