<template>
  <v-card max-width="600" class="mx-auto">
    <v-toolbar color="light-blue" dark>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-toolbar-title
        >Customer profile for {{ customer_card }}</v-toolbar-title
      >

      <v-spacer></v-spacer>

      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-view-module</v-icon>
      </v-btn>
    </v-toolbar>

    <v-list subheader two-line>
      <v-subheader inset>Loaned Items</v-subheader>

      <v-list-item v-for="loaned_item in loaned_items" :key="loaned_item.title">
        <v-list-item-avatar>
          <v-icon class="grey lighten-1" dark> mdi-folder </v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title v-text="loaned_item.title"></v-list-item-title>

          <v-list-item-subtitle
            v-text="loaned_item.subtitle"
          ></v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn icon>
            <v-icon color="grey lighten-1">mdi-information</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>

      <v-divider inset></v-divider>

      <v-subheader inset>Events</v-subheader>

      <v-list-item
        v-for="registered_event in registered_events"
        :key="registered_event.title"
      >
        <v-list-item-avatar>
          <v-icon
            :class="registered_event.color"
            dark
            v-text="registered_event.icon"
          ></v-icon>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title
            v-text="registered_event.title"
          ></v-list-item-title>

          <v-list-item-subtitle
            v-text="registered_event.subtitle"
          ></v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action>
          <v-btn icon>
            <v-icon color="grey lighten-1">mdi-information</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      customer_card: this.$route.params.customer_card,
      admin_card: this.$route.params.admin_card,
      loaned_items: [
        {
          color: "blue",
          icon: "mdi-clipboard-text",
          subtitle: "Jan 20, 2014",
          title: "Vacation itinerary",
        },
        {
          color: "amber",
          icon: "mdi-gesture-tap-button",
          subtitle: "Jan 10, 2014",
          title: "Kitchen remodel",
        },
      ],
      registered_events: [
        {
          subtitle: "Jan 9, 2014",
          title: "Photos",
        },
        {
          subtitle: "Jan 17, 2014",
          title: "Recipes",
        },
        {
          subtitle: "Jan 28, 2014",
          title: "Work",
        },
      ],
    };
  },
};
</script>
