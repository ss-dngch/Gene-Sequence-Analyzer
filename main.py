from pipeline.ingest import load_fasta
from pipeline.qc import validate_sequence
from pipeline.sequence_stats import calculate_stats
from pipeline.sequence_tools import (
    reverse_complement,
    transcribe_dna,
    translate_sequence,
)
from pipeline.orf_finder import find_orfs
from pipeline.mutations import detect_mutations
from pipeline.report import export_mutation_report, plot_base_composition

FASTA_FILE = "data/sample.fasta"

records = load_fasta(FASTA_FILE)

for record in records:
    sequence = str(record.seq)

    print(f"\nSequence ID: {record.id}")

    if validate_sequence(sequence):
        print("Sequence validation: PASSED")

        stats = calculate_stats(sequence)

        print("\nSequence Statistics:")
        for key, value in stats.items():
            print(f"{key}: {value}")

        plot_path = plot_base_composition(stats)
        print(f"\nBase composition plot saved to: {plot_path}")

        rev_comp = reverse_complement(sequence)
        rna = transcribe_dna(sequence)
        protein = translate_sequence(sequence)

        print("\nReverse Complement:")
        print(rev_comp)

        print("\nRNA Transcript:")
        print(rna)

        print("\nProtein Translation:")
        print(protein)

        orfs = find_orfs(sequence)

        print("\nOpen Reading Frames:")

        if orfs:
            for idx, orf in enumerate(orfs, start=1):
                print(f"\nORF {idx}")
                print(f"Start: {orf['start']}")
                print(f"End: {orf['end']}")
                print(f"Length: {orf['length']}")
                print(f"Sequence: {orf['sequence']}")
        else:
            print("No ORFs found.")

    else:
        print("Sequence validation: FAILED")


print("\nMutation Detection")

reference_records = load_fasta("data/reference.fasta")
sample_records = load_fasta("data/sample_mutated.fasta")

reference_sequence = str(reference_records[0].seq)
sample_sequence = str(sample_records[0].seq)

mutations = detect_mutations(reference_sequence, sample_sequence)

if mutations:
    for mutation in mutations:
        print(
            f"Position {mutation['position']}: "
            f"{mutation['reference_base']} → {mutation['sample_base']} "
            f"({mutation['type']})"
        )
else:
    print("No mutations found.")

report_path = export_mutation_report(mutations)

print(f"\nMutation report saved to: {report_path}")
