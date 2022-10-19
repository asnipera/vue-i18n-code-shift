<template>
  <div>
    <div>文本一</div>
    <div>{{ 文本二 }}</div>
    <div>文本三：{{ data }}</div>
    <div>{{ `文本四：${data}` }}</div>
    <div>{{ data ?? "文本五" }}</div>
    <div>{{ data || "文本六" }}</div>
    <div>{{ data ?? "文本七" }}:{{ data || "文本八" }}文本九{{ data }}</div>
    <input placeholder="文本十" />
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  mounted() {
    console.log("你好", "世界");
  },
};
</script>
