<template>
  <div>
    <!-- 文本一 -->
    <div>文本一</div>
    <div>{{ 文本二 }}</div>
    <div>文本三：{{ data }}</div>
    <div>{{ `文本四：${data}` }}</div>
    <!-- 文本五 -->
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
    // 你好
    console.log("你好", `${data + "世界一"}世界二`);
  },
};
</script>
