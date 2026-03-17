# Alpha Notes — 数字员工角色模板

> 2026-03-17 | 复杂度: S

## 技术决策

1. **模板定义在 `types.ts` 中而非 `mockData.ts`**
   - 模板是静态常量，不是可变的 Mock 数据
   - 与 `PLAN_LABELS`、`DEVICE_STATUS_LABELS` 等常量同级

2. **`optgroup` 分组而非平铺列表**
   - 8 个模板按 通用/金融/技术 分组，选择更高效
   - HTML 原生 `<optgroup>` 无需额外 CSS

3. **模板仅填充表单初始值**
   - 选择模板后用户仍可修改任意字段
   - 编辑模式不显示模板选择器（避免覆盖已有配置）

## 测试结果

```
Test Files  5 passed (5)
     Tests  83 passed (83)
  Duration  454ms
```

新增 5 个测试用例：模板数量、分组覆盖、字段完整性、ID 唯一性、插件引用合法性。

## Beta TODO

- 无额外 TODO — S 级需求，Alpha 已覆盖全部 AC
