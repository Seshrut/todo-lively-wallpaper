//package com.todo.todo_lively_wallpapers;
//
//import com.fasterxml.jackson.core.type.TypeReference;
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.todo.todo_lively_wallpapers.post.Post;
//import com.todo.todo_lively_wallpapers.post.PostRepository;
//import org.springframework.boot.CommandLineRunner;
//
//import java.io.IOException;
//import java.io.InputStream;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Optional;
//
//public class DataLoader implements CommandLineRunner{
//
//    private final ObjectMapper objectMapper;
//    private final PostRepository postRepository;
//
//    public DataLoader(ObjectMapper objectMapper, PostRepository postRepository) {
//        this.objectMapper = objectMapper;
//        this.postRepository = postRepository;
//    }
//
//    @Override
//    public void run(String... args) throws Exception{
//
//        List<Post> posts = new ArrayList<>();
//        JsonNode json;
//        try(InputStream inputStream = TypeReference.class.getResourceAsStream("/data/data.json")){
//            json = objectMapper.readValue(inputStream, JsonNode.class);
//        } catch (IOException e){
//            throw new RuntimeException("Failed to read JSON data", e);
//        }
//
//        JsonNode edges = getEdges(json);
//        for(JsonNode edge : edges){
//            posts.add(createPostFromNode(edges));
//        }
//
//    }
//
//    private Post createPostFromNode(JsonNode edges) {
//    }
//
//    private JsonNode getEdges(JsonNode json) {
//        return Optional.ofNullable(json)
//                .map(j -> j.get("shoppingList"))
//                .orElseThrow(() -> new IllegalArgumentException("Invalid JSON object"));
//
//    }
//
//}
