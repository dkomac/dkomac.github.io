
<template>
  <div>
    <div class="presentation-container">
      <h1>{{name}}</h1>
      <h2>{{title}}</h2>
      <h3>{{presentation}}</h3>
      <figure>
        <img :src="imageSrc">
      </figure>
      <div class="line"></div>
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
$main-color: #4f108a;
body {
  margin: 0;
  height: 100vh;
  width: 100%;
  font-family: "Oswald", sans-serif;
  color: $primary-color;
  color: $main-color;
  position: relative;

  .presentation-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    h1 {
      margin: 0;
      font-size: 60px;
      line-height: 1.1;
    }
    h2 {
      margin: 0;
      font-size: 30px;
    }
    h3 {
      margin: 0;
    }

    .line {
      height: 2px;
      width: 100%;
      background-color: $main-color;
      margin: 20px 0 10px 0;
    }

    figure {
      margin: 0;
      position: absolute;
      top: -150px;
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
      transition: color 0.5s;
      color: inherit;
      text-decoration: none;
      margin: 0 10px 0 10px;
      cursor: pointer;

      &:hover {
        color: rgba($main-color, 0.7)
      }
    }
  }
}
</style>
