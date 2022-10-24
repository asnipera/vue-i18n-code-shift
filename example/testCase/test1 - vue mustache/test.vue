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
    <div>文本十一(文本十二)</div>
    <div>
      {{
        "这是一串很长的文字这是一串很长的文字这是一串很长的文字这是一串很长的文字这是一串很长的文字"
      }}
    </div>
    <div>
      <div>
        <div>
          <div>
            【{{
              data
                ? "这是一串容易正则卡死的文字一"
                : "这是一串容易正则卡死的文字二"
            }}-{{
              data
                ? "这是一串容易正则卡死的文字三"
                : "这是一串容易正则卡死的文字四"
            }}】
          </div>
        </div>
      </div>
    </div>
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
