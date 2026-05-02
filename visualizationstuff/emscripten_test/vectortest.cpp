#include <vector>
using namespace std;
int main() {
  int i = 1234;

  std::vector<int> v = { 1,2,3 };
  v[2] = 233333;

  printf("v.size()=%zu\n", v.size());
  printf("v[2]=%d\n", v.at(2));
  return 0;
}
