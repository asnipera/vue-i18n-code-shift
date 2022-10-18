<template>
  <div>
    <div>文本一</div>
    <div>{{ 文本二 }}</div>
    <div>文本三：{{ data }}</div>
    <div>{{ `文本四：${data}` }}</div>
    <div>{{ data ?? "文本五" }}</div>
    <div>{{ data || "文本六" }}</div>
    <div>{{ data ?? "文本七" }}:{{ data || "文本八" }}--{{ data }}</div>
  </div>
</template>