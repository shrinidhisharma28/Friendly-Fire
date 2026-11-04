
function WordEntry({
    value,
    onChange,
    onSubmit,
    disabled = false,
    submitLabel = "Submit",
    placeholder = "Enter your word",
    hint = "Enter a valid five-letter dictionary word."
}) {
    function handleChange(event) {
        const sanitizedValue = event.target.value
            .replace(/[^a-zA-Z]/g, "")
            .slice(0, 5);

        onChange(sanitizedValue);
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (disabled || value.length !== 5) {
            return;
        }

        onSubmit();
    }

    return (
        <form className="wordle-input-form" onSubmit={handleSubmit}>
            <label htmlFor="wordle-word-input">
                {placeholder}
            </label>

            <div className="wordle-input-group">
                <input
                    id="wordle-word-input"
                    type="text"
                    value={value}
                    onChange={handleChange}
                    placeholder="ENTER"
                    maxLength={5}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    disabled={disabled}
                />

                <button
                    type="submit"
                    disabled={disabled || value.length !== 5}
                >
                    {submitLabel}
                </button>
            </div>

            <p className="wordle-input-hint">{hint}</p>
        </form>
    );
}

export default WordEntry;
