
<template>
  <div>
    <div class="presentation-container">
      <h1>{{name}}</h1>
      <h2>{{title}}</h2>
      <h3>{{presentation}}</h3>
      <figure>
        <img :src="imageSrc">
      </figure>
      <div class="icon-container">
        <a class="fab fa-linkedin-in" href="https://www.linkedin.com/in/dennis-komac-b5285381"></a>
        <a class="fab fa-github" href="https://github.com/dkomac"></a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data: function() {
    return {
      name: "Dennis Komac",
      title: "Front-end Developer",
      presentation: "// todo: write presentation",
      imageSrc:
        "https://media.licdn.com/dms/image/C4E03AQHCkK860lK2xg/profile-displayphoto-shrink_200_200/0?e=1564012800&v=beta&t=kNQqzP4-8Nop3hcT4CDIvOSgiExG5pOHY5U5sLqSK8E"
    };
  }
});
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Oswald&display=swap");

$primary-color: white;
$bg: #0c0017;
body {
  margin: 0;
  height: 100vh;
  width: 100%;
  font-family: "Oswald", sans-serif;
  color: $primary-color;
  background-color: $bg;
  position: relative;

  .presentation-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    h1 {
      margin: 0;
      font-size: 60px;
      text-shadow: 1px 0 0 rgba($bg, 0.7), 0 -1px 0 rgba($bg, 0.7),
        0 1px 0 rgba($bg, 0.7), -1px 0 0 rgba($bg, 0.7);
    }
    h2 {
      margin: 0;
      font-size: 30px;
    }
    h3 {
      margin: 0;
    }

    figure {
      margin: 0;
      position: absolute;
      top: -135px;
      right: 50px;
      z-index: -1;
      opacity: 0.8;

      img {
        border-radius: 50%;
      }
    }
  }

  .icon-container {
    font-size: 30px;
    text-align: center;

    a {
      color: inherit;
      text-decoration: none;
      margin: 0 10px 0 10px;
      cursor: pointer;
    }
  }
}
</style>
