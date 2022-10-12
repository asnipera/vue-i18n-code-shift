<template>
  <div class="hello">
    <p>{{ $t('index.haHaHa') }}</p>
    <!-- {{ $t('index.haHaHa') }} -->
    <input :placeholder="$t('index.attribute')" />
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  mounted() {
    console.log(I18N.t('index.attribute'));
  },
};
</script>
