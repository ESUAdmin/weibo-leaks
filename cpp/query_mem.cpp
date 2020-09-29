#include "bloom.inl"
#include <iostream>
#include <fstream>
#include <string>

const char *filename = "../bloom-filter-data.bin";
bitvec *bv = nullptr;

void prepare_file() {
	std::ifstream stream;
	stream.open(filename);
	bv = new bitvec(stream);
}

int get_bit_at(std::size_t bitIndex) {
	return bv->get_at(bitIndex);
}

int main() {
	u64 uid;
	prepare_file();
	printf("Please enter your weibo UID: ");
	scanf("%llu", &uid);

	for (u64 p : magic) {
		std::size_t bitIndex = mix_hash(uid, p) % numBits;
		if (get_bit_at(bitIndex) == 0) {
			printf("Congrats! Your phone number is 100%% NOT leaked.\n");
			return 0;
		}
	}
	printf("Oh, your phone number has a 98%% chance of being leaked.\n");

	delete bv;
	return 0;
}
