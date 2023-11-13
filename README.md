# Kost


## Importing data

Before importing make sure the `DATABASE_URL` environment variable is set and databse is running.

Place files in the `import` directory.
The following files are required:
- `kost-corr.xml`
- `kost-errs.xml`
- `kost-orig.xml`

If you are developing locally, you can use `pnpm import` script to import the data.

```bash
pnpm import-data
```

If you are running a docker container, you can use the `import-prod.sh` script to import the data.

```bash
sh cli/import-prod.sh
```
