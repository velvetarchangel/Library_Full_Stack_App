<template>
  <v-container
    fluid
    style="
      margin: 0 auto 0 auto;
      padding: 0px;
      max-width: 800px;
      width: 90% !important;
    "
  >
    <v-card>
      <v-card-title align-middle class="center accent white--text">
        Login Form
      </v-card-title>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          v-model="email"
          :rules="emailRules"
          label="E-mail"
          required
        ></v-text-field>

        <v-text-field
          v-model="password"
          :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
          :rules="[passwordRules.required, passwordRules.min]"
          :type="show1 ? 'text' : 'password'"
          name="input-10-1"
          label="Type your password here"
          hint="At least 8 characters"
          counter
          @click:append="show1 = !show1"
        ></v-text-field>

        <v-btn
          :disabled="!valid"
          color="success"
          class="mr-4"
          @click="validate"
        >
          Login
        </v-btn>

        <v-btn color="error" class="mr-4" @click="goToSignup()">Signup</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>
<script>
import { testAPI } from "../services/apiServices";
export default {
  name: "Login",
  data: () => ({
    apiRes: null,
    valid: true,
    password: "",
    show1: false,
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => (v && v.length <= 10) || "Name must be less than 10 characters",
    ],
    email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    passwordRules: {
      required: (value) => !!value || "Required.",
      min: (v) => v.length >= 3 || "Min 3 characters",
      emailMatch: () => `The email and password you entered don't match`,
    },
    select: null,
  }),

  methods: {
    testAPI() {
      testAPI().then((response) => {
        this.apiRes = response;
      });
    },

    validate() {
      this.$refs.form.validate();
      // write a function where it talks to the API to log in
    },
    goToSignup() {
      this.$router.push("/signup");
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },
  mounted() {
    this.testAPI();
  },
};
</script>
