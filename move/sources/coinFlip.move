module coin_flip_address::coinFlip
{

    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::timestamp;

    struct CoinFlip has key {
        last_result:bool,
        winning_counter: u64
    }

    public entry fun create_game(account: &signer){
        let game_holder = CoinFlip {
            last_result:false,
            winning_counter: 0
        };
        move_to(account, game_holder);
    }

    public entry fun play(account: &signer , guess: String) acquires CoinFlip {
        let signer_address = signer::address_of(account);
        let game_profile = borrow_global_mut<CoinFlip>(signer_address);
        //generate randomeness.
        let random_number = generateRandomeness();
        let random_number_result=getRandomNumberResult(random_number);
        let result = compareData(random_number_result, guess);

        game_profile.last_result = result;

        if(result == true){
            game_profile.winning_counter = game_profile.winning_counter + 1
        }else{
            game_profile.winning_counter = 0
        }
    }


    fun generateRandomeness() : u64{
        timestamp::now_microseconds()
    }

    fun getRandomNumberResult(number:u64):String{
        if(number % 2 == 0){
            return string::utf8(b"heads")
        };
        return string::utf8(b"tails")
    }

    fun compareData(random_number_result:String , guess:String) : bool{
        if(guess == random_number_result){
            return true
        };
        return false
    }

}