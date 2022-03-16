<template>
  <v-container
    fluid
    style="
      margin: 0 auto 0 auto;
      padding: 50px;
      max-width: 800px;
      width: 90% !important;
    "
  >
    <v-card>
      <v-card-title align-middle class="center accent white--text">
        Login
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
          :error-messages="errormessage"
          name="input-10-1"
          label="Type your password here"
          hint="At least 3 characters"
          counter
          @click:append="show1 = !show1"
        ></v-text-field>

        <v-btn :disabled="!valid" color="success" class="mr-4" @click="login()">
          Login
        </v-btn>

        <v-btn color="error" class="mr-4" @click="goToSignup()">Signup</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import { testAPI, getUserByEmailAndPassword } from "../services/apiServices";
export default {
  name: "Login",
  data: () => ({
    apiRes: null,
    valid: true,
    password: "",
    errormessage: "",
    show1: false,
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

  created: function () {
    this.testAPI();
  },

  methods: {
    // this is a test function and must be removed when actual
    // functionality is implented
    async testAPI() {
      await testAPI().then((response) => {
        this.apiRes = response;
      });
    },

    async login() {
      this.validate();
      let user = { email: this.email, password: this.password };
      await getUserByEmailAndPassword(user).then((response) => {
        if (response.data.status == 200) {
          user = response.data.user; //update the user information
          this.$router.push(`profile/${user.card_no}`);
        } else {
          this.errormessage = response.data.message;
          this.resetValidation();
        }
      });
    },

    validate() {
      this.$refs.form.validate();
    },
    goToSignup() {
      this.$router.push("/signup");
    },
    resetValidation() {
      this.$refs.form.resetValidation();
    },
  },
};
</script>
