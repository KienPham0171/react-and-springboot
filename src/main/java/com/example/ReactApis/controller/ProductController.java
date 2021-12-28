package com.example.ReactApis.controller;

import com.example.ReactApis.model.Book;
import com.example.ReactApis.model.CartItem;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

@RestController
@RequestMapping("api/v1/data")
@CrossOrigin(origins = "http://localhost:3001")
public class ProductController {
    public List<Book> fakeRepo(){
        List<Book> result  = new ArrayList<Book>();
        result.add(new Book(0,"React in action","Kien Pham"));
        result.add(new Book(1,"Redux in action","Pham Kien"));
        result.add(new Book(2,"Spring in action","Kein Pham"));
        return result;
    }
    List<Book> repo = fakeRepo();
    List<CartItem> cartItems = new ArrayList<>();



    @GetMapping("/products")
    public List<Book> getProducts(){
        return this.repo;
    }
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> delProducts(@PathVariable("id") int id){
        deleteProductById(id);
        return  ResponseEntity.ok(this.repo);
    }
    @PutMapping("/products")
    public ResponseEntity<?> updateProduct(@RequestBody Book book){
        for(Book b : this.repo){
            if(b.getId() == book.getId()){
                b.setAuthor(book.getAuthor());
                b.setName(book.getName());
            }
        }
        return ResponseEntity.ok(this.repo);
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Book book){
        boolean check =false;
        for(Book b : this.repo){
            if(book.getAuthor().toLowerCase(Locale.ROOT).compareTo(b.getAuthor().toLowerCase())== 0 &&
              book.getName().toLowerCase().compareTo(b.getName().toLowerCase())==0){
                check = true;
            }
        }
        if(check){
            return ResponseEntity.status(202).body(this.repo);
        }else {
            book.setId(getMaxId()+1);
            this.repo.add(book);
            return ResponseEntity.ok(this.repo);
        }

    }

    @GetMapping("/cartItems")
    public ResponseEntity<?> getCartItems(){
        return ResponseEntity.ok(this.cartItems);
    }

    public void setCartItems(List<CartItem> cartItems) {
        this.cartItems = cartItems;
    }

    @PostMapping("/cartItems")
    public ResponseEntity<?> createCartItems(@RequestBody(required = false) Book rq){
        System.err.println(rq.getId());
        Book b =findBookById(rq.getId());

        if(b != null) {
            CartItem cs = findCartItemById(b.getId());
            if(cs ==null){
                List<CartItem> ls = this.cartItems;
                ls.add(new CartItem(b.getId(),b.getName(),b.getAuthor(),1));
                setCartItems(ls);
            }else{
                List<CartItem> rs = new ArrayList<>();
                for(CartItem c : this.cartItems){
                    if(c.getId() == b.getId()){
                        c.setAmount(c.getAmount()+1);
                    }
                    rs.add(c);
                }
                setCartItems(rs);
            }

        }
        return ResponseEntity.ok(this.cartItems);

    }
    @DeleteMapping("/cartItems/{id}")
    public ResponseEntity<?> delCartItems(@PathVariable("id") int id){
        delCartItemById(id);
        return  ResponseEntity.ok(this.cartItems);
    }

    private int getMaxId(){
        int maxId = -1;
        for(Book b : this.repo){
            if (b.getId() > maxId) maxId = b.getId();
        }
        return maxId;
    }
    private void delCartItemById(int id){
        List<CartItem> newC = new ArrayList<>();
        for(CartItem c : this.cartItems){
            if(c.getId() != id) newC.add(c);
        }
        setCartItems(newC);
    }

    private CartItem findCartItemById(int id){
        CartItem rs = null;
        for(CartItem c : this.cartItems){
            if(c.getId() == id) rs =c;
        }
        return rs;
    }
    private Book findBookById(int id){
        Book rs = null;
        for(Book b : this.repo){
            if(b.getId() == id) rs = b;
        }
        return rs;
    }
    private void deleteProductById(int id){
        var rs = this.repo;
        for (int i = 0; i < rs.size() ; i++) {
            if(rs.get(i).getId() == id) {
                rs.remove(i);
            }
        }
        setRepo(rs);
    }
    public List<Book> getRepo() {
        return repo;
    }

    public void setRepo(List<Book> repo) {
        this.repo = repo;
    }
}
