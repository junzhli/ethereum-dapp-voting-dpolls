const bluebirdConfig = () => {
    if (process.env.NODE_ENV === "production") {
        return {
            longStackTraces: false,
            warnings: false
        };
    } else {
        return {
            longStackTraces: true,
            warnings: true // note, run node with --trace-warnings to see full stack traces for warnings
        };
    }
};

export default bluebirdConfig();
