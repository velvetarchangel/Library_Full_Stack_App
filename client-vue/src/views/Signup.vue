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
        Sign Up
      </v-card-title>
      <form>
        <v-container fluid style="margin: 0 auto 0 auto; width: 90%">
          <v-row justify="center">
            <v-col cols="12" sm="10">
              <v-row>
                <v-text-field
                  v-model="first_name"
                  placeholder="First"
                  label="First"
                  outlined
                  required
                  color="accent"
                ></v-text-field>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="last_name"
                  placeholder="Last"
                  label="Last"
                  outlined
                  required
                  color="accent"
                ></v-text-field>
              </v-row>
              <v-row>
                <v-text-field
                  v-model="email"
                  placeholder="first.last@email.com"
                  :rules="emailrules"
                  label="Email"
                  outlined
                  required
                  color="accent"
                  :error-messages="errormessage"
                ></v-text-field>
              </v-row>
              <v-row>
                <v-text-field
                  v-model="password"
                  placeholder="******"
                  :rules="passwordrules"
                  label="Password"
                  outlined
                  required
                  color="accent"
                  :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="passwordVisible ? 'text' : 'password'"
                  name="input-10-2"
                  hint="At least 8 characters"
                  @click:append="passwordVisible = !passwordVisible"
                ></v-text-field>
              </v-row>
              <v-row>
                <v-text-field
                  v-model="checkpassword"
                  :rules="matches"
                  placeholder="******"
                  :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="passwordVisible ? 'text' : 'password'"
                  name="input-10-2"
                  label="Confirm"
                  outlined
                  required
                  color="accent"
                  @keydown.enter="signUp()"
                ></v-text-field>
              </v-row>
              <v-col>
                <v-btn
                  color="accent"
                  width="100%"
                  margin-bottom="1em"
                  :disabled="!isValid"
                  @click="signUp()"
                >
                  Sign Up
                </v-btn>
              </v-col>
              <v-col>
                <v-btn width="100%" color="accent" @click="$router.push('/')">
                  Already a member? Sign in
                </v-btn>
              </v-col>
            </v-col>
          </v-row>
        </v-container>
      </form>
    </v-card>
  </v-container>
</template>

<script>
import { createUser } from "../services/apiServices";
export default {
  name: "Signup",
  data() {
    return {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      checkpassword: "",
      passwordVisible: false,
      isValid: true,
      errormessage: "",
      emailrules: [
        (v) =>
          !v ||
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) ||
          "E-mail must be valid" ||
          "E-mail is required",
      ],
      passwordrules: [
        (v) => (v && v.length >= 3) || "Password must have 3+ characters",
      ],
      matches: [
        () => this.password == this.checkpassword || "Passwords must match",
      ],
    };
  },
  methods: {
    async signUp() {
      let newUser = {
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        user_password: this.password,
      };

      await createUser(newUser).then((response) => {
        if (response.data.status == 200) {
          newUser = response.data.user;
          this.$router.push(`profile/${newUser.card_no}`);
        } else {
          this.errormessage = response.data.message;
        }
      });
    },
  },
};
</script>
