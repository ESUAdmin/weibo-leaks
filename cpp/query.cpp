#include "bloom.inl"
#include <iostream>
#include <cstdio>

FILE* stream = NULL;
const int sizeOffset = sizeof(std::size_t); // sizeof(bit size of bloom filter)
const char *filename = "../bloom-filter-data.bin";

void prepare_file() {
	stream = std::fopen(filename, "r");
	if (! stream) {
		std::printf("Fatal error: cannot open filter data %s\nTerminating...\n", filename);
		std::exit(1);
	}
}

int get_bit_at(std::size_t bitIndex) {
	printf("bitIndex: %ld ", bitIndex);
	std::size_t byteIndex = bitIndex / 8, byteOffset = bitIndex % 8;
	printf("byteIndex: %ld\n", byteIndex);
	if (std::fseek(stream, sizeOffset + byteIndex, SEEK_SET) == 0) {
		unsigned char byte = std::fgetc(stream);
		return (byte >> byteOffset) & 1;
	} else {
		std::printf("Error: cannot seek to %ld\n", byteIndex);
		std::exit(1);
	}
}

int main() {
	u64 uid;
	prepare_file();
	printf("Please enter your weibo UID: ");
	scanf("%llu", &uid);

	for (u64 p : magic) {
		std::cout << mix_hash(uid, p) << "\n";
		std::size_t bitIndex = mix_hash(uid, p) % numBits;
		if (get_bit_at(bitIndex) == 0) {
			printf("Congrats! Your phone number is 100%% NOT leaked.\n");
			return 0;
		}
	}
	printf("Oh, your phone number has a 98%% chance of being leaked.\n");
	return 0;
}
