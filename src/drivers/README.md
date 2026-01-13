# Drivers

Drivers are simple factories registered in `src/drivers/index.ts`.

Use CLI to scaffold:

```bash
mova driver:add my_driver
```

This generates `src/drivers/my_driver.ts` with `execute` method and registers it.
