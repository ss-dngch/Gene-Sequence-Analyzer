def detect_mutations(reference_sequence, sample_sequence):
    reference_sequence = reference_sequence.upper()
    sample_sequence = sample_sequence.upper()

    mutations = []

    max_length = max(len(reference_sequence), len(sample_sequence))

    for i in range(max_length):
        ref_base = reference_sequence[i] if i < len(reference_sequence) else "-"
        sample_base = sample_sequence[i] if i < len(sample_sequence) else "-"

        if ref_base != sample_base:
            if ref_base == "-":
                mutation_type = "Insertion"
            elif sample_base == "-":
                mutation_type = "Deletion"
            else:
                mutation_type = "SNP"

            mutations.append(
                {
                    "position": i + 1,
                    "reference_base": ref_base,
                    "sample_base": sample_base,
                    "type": mutation_type,
                }
            )

    return mutations
