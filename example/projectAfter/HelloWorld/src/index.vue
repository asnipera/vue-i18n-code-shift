<template>
  <div class="hello">
    <p>加油</p>
    <input :placeholder="属性" />
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  mounted() {
    console.log('属性');
  },
};
</script>
